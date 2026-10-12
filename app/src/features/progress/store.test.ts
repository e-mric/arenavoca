import { it, expect } from "vitest";
import raw from "../../../public/content/match.json";
import { validateContent } from "../content/model";
import {
  emptySnapshot,
  ProgressStore,
  PROGRESS_KEY,
  validateSnapshot,
} from "./store";
const content = validateContent(raw);
const memory = () => {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
  };
};
it("saves once and restores from a new instance", () => {
  const storage = memory();
  const p = new ProgressStore(() => storage);
  const once = p.savePhrase(emptySnapshot(content.version), "pass")!;
  const twice = p.savePhrase(once, "pass")!;
  expect(twice.savedPhraseIds).toEqual(["pass"]);
  expect(
    new ProgressStore(() => storage).read(content).snapshot.savedPhraseIds,
  ).toEqual(["pass"]);
});
it("failed writes never claim Saved or mutate the caller", () => {
  const p = new ProgressStore(() => ({
    getItem: () => null,
    setItem: () => {
      throw new Error("quota");
    },
  }));
  const snapshot = emptySnapshot(content.version);
  expect(p.savePhrase(snapshot, "pass")).toBeNull();
  expect(snapshot.savedPhraseIds).toEqual([]);
});
it("handles storage access denial", () => {
  const p = new ProgressStore(() => {
    throw new Error("denied");
  });
  expect(p.read(content).warning).toContain("storage");
  expect(p.write(emptySnapshot(content.version))).toBe(false);
});
it.each([
  "{broken",
  "null",
  JSON.stringify({ ...emptySnapshot("obsolete") }),
  JSON.stringify({
    ...emptySnapshot(content.version),
    savedPhraseIds: ["unknown"],
  }),
  JSON.stringify({
    ...emptySnapshot(content.version),
    resumableSession: { position: Infinity },
  }),
])("recovers from malformed data %s", (raw) => {
  const storage = memory();
  storage.setItem(PROGRESS_KEY, raw);
  const result = new ProgressStore(() => storage).read(content);
  expect(result.warning).toBeTruthy();
  expect(result.snapshot.savedPhraseIds).toEqual([]);
});
it("persists a paused session with review eligibility and preferences", () => {
  const storage = memory(),
    p = new ProgressStore(() => storage);
  const snapshot = emptySnapshot(content.version);
  snapshot.preferences.muted = true;
  snapshot.preferences.panelSide = "left";
  snapshot.preferences.panelDistance = "far";
  snapshot.preferences.panelHeight = "high";
  snapshot.resumableSession = {
    position: 15,
    seenEventIds: ["pass-01"],
    seenPhraseIds: ["pass"],
    completed: false,
  };
  expect(p.write(snapshot)).toBe(true);
  expect(p.read(content).snapshot).toEqual(snapshot);
});
it("migrates existing progress without dropping saved phrases", () => {
  const old = {
    ...emptySnapshot(content.version),
    savedPhraseIds: ["pass"],
    preferences: { muted: false, promptsHidden: false, panelSide: "left" },
  };
  const migrated = validateSnapshot(old, content)!;
  expect(migrated.savedPhraseIds).toEqual(["pass"]);
  expect(migrated.preferences).toMatchObject({
    panelSide: "left",
    panelDistance: "far",
    panelHeight: "high",
  });
});
it.each([
  { panelDistance: "invalid" },
  { panelHeight: 20 },
  { team: "constructor" },
  { team: "ferrari", sport: "football" },
  { commentaryLanguage: "invalid" },
])("rejects invalid positioning preferences", (preferences) => {
  const snapshot = emptySnapshot(content.version);
  expect(
    validateSnapshot(
      {
        ...snapshot,
        preferences: { ...snapshot.preferences, ...preferences },
      },
      content,
    ),
  ).toBeNull();
});
