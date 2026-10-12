import { describe, expect, it } from "vitest";
import {
  StreamStore,
  freshStreamProgress,
  validateStreamProgress,
  STREAM_KEY,
} from "./progress";
function fixture() {
  const data = new Map<string, string>();
  const store = new StreamStore(() => ({
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v);
    },
  }));
  return { data, store };
}
describe("long-form progress", () => {
  it("keeps team choices, phrases and positions scoped to their recording", () => {
    const { store } = fixture();
    store.team("barca", "barcelona");
    store.team("f1-behind-charge", "mclaren");
    store.savePhrase("barca");
    store.savePhrase("barca");
    store.bookmark("barca", 940);
    store.bookmark("f1-behind-charge", 24);
    expect(store.read()).toEqual({
      version: 1,
      teams: { barca: "barcelona", "f1-behind-charge": "mclaren" },
      saved: ["barca"],
      bookmarks: [
        { source: "barca", position: 940 },
        { source: "f1-behind-charge", position: 24 },
      ],
    });
    expect(store.team("barca", "ferrari")).toBe(false);
  });
  it("deduplicates nearby moments and bounds history", () => {
    const { store } = fixture();
    store.bookmark("barca", 20);
    store.bookmark("barca", 20.5);
    expect(store.read().bookmarks).toHaveLength(1);
    for (let i = 0; i < 55; i++) store.bookmark("barca", 30 + i * 2);
    expect(store.read().bookmarks).toHaveLength(50);
    expect(store.bookmark("barca", Infinity)).toBe(false);
    expect(store.bookmark("barca", -10)).toBe(false);
  });
  it("returns no false success when storage is unavailable", () => {
    const store = new StreamStore(() => {
      throw new Error("denied");
    });
    expect(store.read()).toEqual(freshStreamProgress());
    expect(
      validateStreamProgress({ ...freshStreamProgress(), teams: "bad" }),
    ).toBeNull();
    expect(store.savePhrase("barca")).toBe(false);
    expect(store.bookmark("barca", 30)).toBe(false);
  });
  it("recovers corrupted storage", () => {
    const { store, data } = fixture();
    data.set(STREAM_KEY, "bad JSON");
    expect(store.read()).toEqual(freshStreamProgress());
    expect(
      validateStreamProgress({
        ...freshStreamProgress(),
        bookmarks: [{ source: "barca", position: -1 }],
      }),
    ).toBeNull();
    expect(
      validateStreamProgress({
        ...freshStreamProgress(),
        saved: ["barca", "barca"],
      }),
    ).toBeNull();
  });
  it("preserves football data when replacing Miami without reusing its timestamps", () => {
    expect(
      validateStreamProgress({
        version: 1,
        teams: { barca: "barcelona", "f1-miami": "mclaren" },
        saved: ["barca", "f1-miami"],
        bookmarks: [
          { source: "barca", position: 120 },
          { source: "f1-miami", position: 800 },
        ],
      }),
    ).toEqual({
      version: 1,
      teams: { barca: "barcelona", "f1-behind-charge": "mclaren" },
      saved: ["barca"],
      bookmarks: [{ source: "barca", position: 120 }],
    });
  });
});
