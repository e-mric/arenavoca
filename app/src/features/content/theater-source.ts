import { assetUrl, validateContent, type Content } from "./model";
import { streamLessons } from "../sports/practice";
export type TheaterSource =
  | { kind: "sample" }
  | {
      kind: "video";
      id: string;
      title: string;
      sport: "football" | "f1";
      video: string;
    };
export function validateTheaterSource(value: unknown): TheaterSource {
  const s = value as Partial<Extract<TheaterSource, { kind: "video" }>>;
  if (s && (s.kind as string) === "sample") return { kind: "sample" };
  if (
    !s ||
    s.kind !== "video" ||
    !s.id ||
    !/^[a-z0-9-]{1,80}$/.test(s.id) ||
    typeof s.title !== "string" ||
    !s.title.trim() ||
    s.title.length > 150 ||
    !["football", "f1"].includes(s.sport ?? "") ||
    typeof s.video !== "string" ||
    !/^media\/[a-z0-9/_\-.]+\.(mp4|webm)$/i.test(s.video) ||
    s.video.includes("..")
  )
    throw new Error(
      "The immersive video source is invalid. Use a local MP4 or WebM under media/.",
    );
  return s as Extract<TheaterSource, { kind: "video" }>;
}
export async function loadTheaterSource(): Promise<TheaterSource> {
  if (new URLSearchParams(location.search).get("sample") === "1")
    return { kind: "sample" };
  const response = await fetch(assetUrl("content/theater-source.json"));
  if (!response.ok)
    throw new Error(
      "The theater source could not load. Retry or use the calibration clip.",
    );
  return validateTheaterSource(await response.json());
}
/** Manual concepts never claim that an action was detected in supplied footage. */
export function theaterPracticeContent(
  source: Extract<TheaterSource, { kind: "video" }>,
  duration: number,
): Content {
  if (!Number.isFinite(duration) || duration < 1 || duration > 43200)
    throw new Error(
      "The theater video needs a readable duration between one second and twelve hours.",
    );
  const lesson = streamLessons[source.sport],
    actionEnd = Math.min(0.25, duration / 4);
  return validateContent({
    title: source.title,
    sport: source.sport,
    manualPractice: true,
    version: `theater-${source.id}-${source.sport}`,
    duration,
    video: source.video,
    phrases: [
      {
        id: lesson.id,
        spanish: lesson.spanish,
        english: lesson.english,
        chunks: lesson.chunks,
        pronunciation: lesson.audio,
        action: lesson.id,
        reviewStatus: "pending",
      },
    ],
    events: [
      {
        id: "manual-practice",
        phraseId: lesson.id,
        diagramId: "concept",
        actionStart: 0,
        actionEnd,
        promptStart: actionEnd,
        promptEnd: Math.min(duration, actionEnd + 7),
      },
    ],
    diagrams: [
      {
        id: "concept",
        duration: 3,
        route: lesson.route,
        players: [
          { id: "7", team: "blue", position: lesson.route[0] },
          { id: "9", team: "blue", position: lesson.route[1] },
        ],
      },
    ],
    captions: [],
  });
}
