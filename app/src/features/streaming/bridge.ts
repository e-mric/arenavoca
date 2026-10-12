import { sources, type SourceId } from "./catalog";
import type { Team } from "../theme/team-theme";
export interface WatchState {
  kind: "state";
  source: SourceId;
  team: Team;
  position: number;
  duration: number;
  playing: boolean;
  ready: boolean;
  saved: boolean;
  bookmarks: number[];
  error: string;
  learningStatus: string;
}
export type WatchCommand = {
  kind: "command";
  source: SourceId;
  action:
    "toggle" | "bookmark" | "save" | "team" | "speaking" | "bye" | "hello";
  team?: Team;
  speaking?: boolean;
};
export function validWatchMessage(
  value: unknown,
): value is WatchState | WatchCommand {
  if (!value || typeof value !== "object") return false;
  const m = value as {
    kind: string;
    source: unknown;
    team: Team;
    position: number;
    duration: number;
    playing: boolean;
    ready: boolean;
    saved: boolean;
    bookmarks: number[];
    error: string;
    learningStatus: string;
    action: string;
    speaking?: boolean;
  };
  const source = sources.find((s) => s.id === m.source);
  if (!source) return false;
  if (m.kind === "state")
    return (
      source.teams.includes(m.team) &&
      [m.position, m.duration].every(
        (v) => Number.isFinite(v) && v >= 0 && v <= 43200,
      ) &&
      typeof m.playing === "boolean" &&
      typeof m.ready === "boolean" &&
      typeof m.saved === "boolean" &&
      typeof m.error === "string" &&
      m.error.length < 1000 &&
      typeof m.learningStatus === "string" &&
      m.learningStatus.length < 1000 &&
      Array.isArray(m.bookmarks) &&
      m.bookmarks.length <= 50 &&
      m.bookmarks.every((v) => Number.isFinite(v) && v >= 0 && v <= 43200)
    );
  if (
    m.kind !== "command" ||
    ![
      "toggle",
      "bookmark",
      "save",
      "team",
      "speaking",
      "bye",
      "hello",
    ].includes(m.action)
  )
    return false;
  if (m.action === "team") return source.teams.includes(m.team);
  if (m.action === "speaking") return typeof m.speaking === "boolean";
  return true;
}
export function validRoom(value: string | null) {
  return !!value && /^[a-zA-Z0-9-]{8,64}$/.test(value);
}
