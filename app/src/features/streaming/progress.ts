import { sourceById, sources, type SourceId } from "./catalog";
import type { Team } from "../theme/team-theme";
export const STREAM_KEY = "sports-spanish.stream.v1";
export interface StreamProgress {
  version: 1;
  teams: Record<SourceId, Team>;
  saved: SourceId[];
  bookmarks: { source: SourceId; position: number }[];
}
export const freshStreamProgress = (): StreamProgress => ({
  version: 1,
  teams: { barca: "neutral", "f1-behind-charge": "neutral" },
  saved: [],
  bookmarks: [],
});
export function validateStreamProgress(value: unknown): StreamProgress | null {
  if (!value || typeof value !== "object") return null;
  const p = value as StreamProgress;
  if (p.version !== 1 || !p.teams || typeof p.teams !== "object") return null;
  // Preserve football progress, but never transfer recording timestamps to a
  // replacement F1 source.
  if (
    p.version === 1 &&
    p.teams &&
    ("f1-miami" in p.teams || "f1-zandvoort" in p.teams) &&
    !("f1-behind-charge" in p.teams)
  ) {
    const old = p.teams as Record<string, Team>;
    const previousTeam = old["f1-zandvoort"] ?? old["f1-miami"];
    p.teams = {
      barca: old.barca,
      "f1-behind-charge": sources[1].teams.includes(previousTeam)
        ? previousTeam
        : "neutral",
    };
    if (Array.isArray(p.saved))
      p.saved = p.saved.filter((id) => id === "barca");
    if (Array.isArray(p.bookmarks))
      p.bookmarks = p.bookmarks.filter((b) => b?.source === "barca");
  }
  if (
    p.version !== 1 ||
    !p.teams ||
    !sources.every((s) => s.teams.includes(p.teams[s.id])) ||
    !Array.isArray(p.saved) ||
    p.saved.length > 2 ||
    new Set(p.saved).size !== p.saved.length ||
    !p.saved.every((id) => sources.some((s) => s.id === id)) ||
    !Array.isArray(p.bookmarks) ||
    p.bookmarks.length > 50
  )
    return null;
  if (
    !p.bookmarks.every(
      (b) =>
        b &&
        sources.some((s) => s.id === b.source) &&
        Number.isFinite(b.position) &&
        b.position >= 0 &&
        b.position <= 43200,
    )
  )
    return null;
  return p;
}
export class StreamStore {
  constructor(
    private getStorage: () => Pick<Storage, "getItem" | "setItem"> = () =>
      localStorage,
  ) {}
  read() {
    try {
      return (
        validateStreamProgress(
          JSON.parse(this.getStorage().getItem(STREAM_KEY) ?? "null"),
        ) ?? freshStreamProgress()
      );
    } catch {
      return freshStreamProgress();
    }
  }
  write(p: StreamProgress) {
    try {
      this.getStorage().setItem(STREAM_KEY, JSON.stringify(p));
      return true;
    } catch {
      return false;
    }
  }
  savePhrase(source: SourceId) {
    const p = this.read();
    p.saved = [...new Set([...p.saved, source])];
    return this.write(p);
  }
  team(source: SourceId, team: Team) {
    if (!sourceById(source).teams.includes(team)) return false;
    const p = this.read();
    p.teams[source] = team;
    return this.write(p);
  }
  bookmark(source: SourceId, position: number) {
    if (!Number.isFinite(position) || position < 0 || position > 43200)
      return false;
    const p = this.read();
    if (
      !p.bookmarks.some(
        (b) => b.source === source && Math.abs(b.position - position) < 1,
      )
    )
      p.bookmarks = [...p.bookmarks, { source, position }].slice(-50);
    return this.write(p);
  }
}
