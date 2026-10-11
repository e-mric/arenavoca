export type Point = readonly [number, number];
export interface Phrase {
  id: string;
  spanish: string;
  english: string;
  chunks: string[];
  pronunciation: string;
  action: "pass";
  reviewStatus: "pending" | "reviewed";
}
export interface MatchEvent {
  id: string;
  phraseId: string;
  diagramId: string;
  actionStart: number;
  actionEnd: number;
  promptStart: number;
  promptEnd: number;
}
export interface Diagram {
  id: string;
  duration: number;
  route: Point[];
  players: { id: string; team: "blue" | "amber"; position: Point }[];
}
export interface Caption {
  start: number;
  end: number;
  text: string;
}
export interface Content {
  version: string;
  duration: number;
  video: string;
  phrases: Phrase[];
  events: MatchEvent[];
  diagrams: Diagram[];
  captions: Caption[];
}
const record = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const text = (x: unknown): x is string =>
  typeof x === "string" && x.trim().length > 0;
const number = (x: unknown): x is number =>
  typeof x === "number" && Number.isFinite(x);
const path = (x: unknown): x is string =>
  text(x) && /^[a-z\d][a-z\d/_\-.]*$/i.test(x) && !x.includes("..");
const point = (x: unknown): x is Point =>
  Array.isArray(x) &&
  x.length === 2 &&
  x.every((v) => number(v) && v >= 0 && v <= 1);
function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(`Content: ${message}`);
}
export function validateContent(raw: unknown): Content {
  assert(
    record(raw) &&
      text(raw.version) &&
      number(raw.duration) &&
      raw.duration > 0 &&
      path(raw.video),
    "invalid match metadata",
  );
  for (const key of ["phrases", "events", "diagrams", "captions"])
    assert(Array.isArray(raw[key]), `${key} must be an array`);
  const data = raw as unknown as Content;
  for (const [key, entries] of Object.entries({
    phrases: data.phrases,
    events: data.events,
    diagrams: data.diagrams,
  })) {
    assert(
      entries.every((x) => record(x) && text(x.id)),
      `invalid ${key} ID`,
    );
    assert(
      new Set(entries.map((x) => x.id)).size === entries.length,
      `duplicate ${key} ID`,
    );
  }
  assert(
    data.phrases.length > 0 &&
      data.events.length > 0 &&
      data.diagrams.length > 0,
    "empty content",
  );
  for (const p of data.phrases)
    assert(
      text(p.spanish) &&
        text(p.english) &&
        Array.isArray(p.chunks) &&
        p.chunks.length === 3 &&
        p.chunks.every(text) &&
        path(p.pronunciation) &&
        p.action === "pass" &&
        ["pending", "reviewed"].includes(p.reviewStatus),
      "invalid phrase",
    );
  for (const d of data.diagrams) {
    assert(
      number(d.duration) &&
        d.duration > 0 &&
        Array.isArray(d.route) &&
        d.route.length >= 2 &&
        d.route.every(point),
      "invalid route",
    );
    assert(
      d.route.some((p) => p[0] !== d.route[0][0] || p[1] !== d.route[0][1]),
      "zero-length route",
    );
    assert(
      Array.isArray(d.players) &&
        d.players.length >= 2 &&
        d.players.every(
          (p) =>
            record(p) &&
            text(p.id) &&
            ["blue", "amber"].includes(p.team) &&
            point(p.position),
        ),
      "invalid players",
    );
  }
  let end = -1;
  for (const e of [...data.events].sort(
    (a, b) => a.promptStart - b.promptStart,
  )) {
    assert(
      [e.actionStart, e.actionEnd, e.promptStart, e.promptEnd].every(number) &&
        e.actionStart >= 0 &&
        e.actionStart < e.actionEnd &&
        e.actionEnd <= e.promptStart &&
        e.promptStart < e.promptEnd &&
        e.promptEnd <= data.duration &&
        e.promptEnd - e.promptStart <= 8,
      "invalid event interval",
    );
    assert(e.promptStart >= end, "overlapping prompts");
    end = e.promptEnd;
    assert(
      data.phrases.some((p) => p.id === e.phraseId) &&
        data.diagrams.some((d) => d.id === e.diagramId),
      "unknown event reference",
    );
  }
  for (const c of data.captions)
    assert(
      record(c) &&
        number(c.start) &&
        number(c.end) &&
        c.start >= 0 &&
        c.start < c.end &&
        c.end <= data.duration &&
        text(c.text),
      "invalid caption",
    );
  return data;
}
export const assetUrl = (path: string, base = import.meta.env.BASE_URL) =>
  `${base.replace(/\/?$/, "/")}${path.replace(/^\/+/, "")}`;
export async function loadContent(): Promise<Content> {
  const response = await fetch(assetUrl("content/match.json"));
  if (!response.ok)
    throw new Error("The match information could not load. Please retry.");
  return validateContent(await response.json());
}
