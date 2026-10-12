import type { Sport, Team } from "../theme/team-theme";
export type SourceId = "barca" | "f1-behind-charge";
export interface StreamSource {
  id: SourceId;
  sport: Sport;
  videoId: string;
  title: string;
  uploader: string;
  teams: Team[];
}
export const sources: readonly StreamSource[] = [
  {
    id: "barca",
    sport: "football",
    videoId: "WMjohb2tq7Y",
    title: "Barça 5–1 Madrid · Full match (2018)",
    uploader: "FC Barcelona",
    teams: ["neutral", "barcelona", "madrid"],
  },
  {
    id: "f1-behind-charge",
    sport: "f1",
    videoId: "i5EnUkFLaWs",
    title: "F1 · Behind the Charge",
    uploader: "Oracle Red Bull Racing",
    teams: ["neutral", "ferrari", "mclaren"],
  },
];
export function sourceById(id: string | null): StreamSource {
  return (
    sources.find(
      (s) =>
        s.id ===
        (["f1-miami", "f1-zandvoort"].includes(id ?? "")
          ? "f1-behind-charge"
          : id),
    ) ?? sources[0]
  );
}
export const youtubeUrl = (source: StreamSource) =>
  `https://www.youtube.com/watch?v=${source.videoId}`;
