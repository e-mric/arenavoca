import type { Content } from "../content/model";
export const PROGRESS_KEY = "football-spanish.progress.v1";
export interface Snapshot {
  schemaVersion: 1;
  contentVersion: string;
  savedPhraseIds: string[];
  preferences: {
    muted: boolean;
    promptsHidden: boolean;
    panelSide: "left" | "right";
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
  preferences: { muted: false, promptsHidden: false, panelSide: "right" },
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
