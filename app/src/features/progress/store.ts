import type { Content } from "../content/model";
import { teamThemes, type Sport } from "../theme/team-theme";
export const PROGRESS_KEY = "football-spanish.progress.v1";
export interface Snapshot {
  schemaVersion: 1;
  contentVersion: string;
  savedPhraseIds: string[];
  preferences: {
    muted: boolean;
    promptsHidden: boolean;
    panelSide: "left" | "right";
    panelDistance: "near" | "far";
    panelHeight: "low" | "high";
    team: import("../karaoke/karaoke").Team;
    karaokeEnabled: boolean;
    sport: Sport;
    commentaryLanguage: "english" | "spanish";
  };
  resumableSession: {
    position: number;
    seenEventIds: string[];
    seenPhraseIds: string[];
    completed: boolean;
  } | null;
}
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export const emptySnapshot = (version: string): Snapshot => ({
  schemaVersion: 1,
  contentVersion: version,
  savedPhraseIds: [],
  preferences: {
    muted: false,
    promptsHidden: false,
    panelSide: "right",
    panelDistance: "far",
    panelHeight: "high",
    team: "neutral",
    karaokeEnabled: false,
    sport: "football",
    commentaryLanguage: "english",
  },
  resumableSession: null,
});
export function validateSnapshot(
  value: unknown,
  content: Content,
): Snapshot | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Snapshot;
  const ids = (x: unknown, known: string[]): x is string[] =>
    Array.isArray(x) &&
    x.length <= known.length &&
    new Set(x).size === x.length &&
    x.every((id) => known.includes(id));
  if (
    v.schemaVersion !== 1 ||
    v.contentVersion !== content.version ||
    !ids(
      v.savedPhraseIds,
      content.phrases.map((p) => p.id),
    )
  )
    return null;
  const p = v.preferences;
  if (
    !p ||
    typeof p.muted !== "boolean" ||
    typeof p.promptsHidden !== "boolean" ||
    !["left", "right"].includes(p.panelSide)
  )
    return null;
  // Add positioning preferences to existing v1 progress without losing saved phrases.
  if (p.panelDistance === undefined) p.panelDistance = "far";
  if (p.panelHeight === undefined) p.panelHeight = "high";
  if (
    !["near", "far"].includes(p.panelDistance) ||
    !["low", "high"].includes(p.panelHeight)
  )
    return null;
  if (p.team === undefined) p.team = "neutral";
  if (p.karaokeEnabled === undefined) p.karaokeEnabled = false;
  if (
    !Object.prototype.hasOwnProperty.call(teamThemes, p.team) ||
    typeof p.karaokeEnabled !== "boolean"
  )
    return null;
  if (p.sport === undefined) p.sport = "football";
  if (p.commentaryLanguage === undefined) p.commentaryLanguage = "english";
  if (
    !["football", "f1"].includes(p.sport) ||
    !["english", "spanish"].includes(p.commentaryLanguage)
  )
    return null;
  const teamSport = teamThemes[p.team].sport;
  if (teamSport && teamSport !== p.sport) return null;
  const s = v.resumableSession;
  if (
    s !== null &&
    (!s ||
      !Number.isFinite(s.position) ||
      s.position < 0 ||
      s.position > content.duration ||
      typeof s.completed !== "boolean" ||
      !ids(
        s.seenEventIds,
        content.events.map((e) => e.id),
      ) ||
      !ids(
        s.seenPhraseIds,
        content.phrases.map((p) => p.id),
      ))
  )
    return null;
  return v;
}
export class ProgressStore {
  constructor(
    private readonly getStorage: () => StoragePort = () => window.localStorage,
  ) {}
  read(content: Content): { snapshot: Snapshot; warning?: string } {
    try {
      const raw = this.getStorage().getItem(PROGRESS_KEY);
      if (!raw) return { snapshot: emptySnapshot(content.version) };
      const snapshot = validateSnapshot(JSON.parse(raw), content);
      if (snapshot) return { snapshot };
      return {
        snapshot: emptySnapshot(content.version),
        warning: "Stored progress could not be read. Starting fresh.",
      };
    } catch {
      return {
        snapshot: emptySnapshot(content.version),
        warning:
          "Device storage is unavailable or damaged. Progress may not survive reopening.",
      };
    }
  }
  write(snapshot: Snapshot): boolean {
    try {
      this.getStorage().setItem(PROGRESS_KEY, JSON.stringify(snapshot));
      return true;
    } catch {
      return false;
    }
  }
  savePhrase(snapshot: Snapshot, id: string): Snapshot | null {
    const next = {
      ...snapshot,
      savedPhraseIds: [...new Set([...snapshot.savedPhraseIds, id])],
    };
    return this.write(next) ? next : null;
  }
}
