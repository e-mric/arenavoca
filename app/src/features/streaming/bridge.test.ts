import { describe, expect, it } from "vitest";
import { validRoom, validWatchMessage, type WatchState } from "./bridge";
const state: WatchState = {
  kind: "state",
  source: "barca",
  team: "barcelona",
  position: 48,
  duration: 5961,
  playing: true,
  ready: true,
  saved: false,
  bookmarks: [42],
  error: "",
  learningStatus: "",
};
describe("floating window messages", () => {
  it("accepts source-scoped clock and controls", () => {
    expect(validWatchMessage(state)).toBe(true);
    for (const action of ["toggle", "bookmark", "save", "hello", "bye"])
      expect(
        validWatchMessage({ kind: "command", source: "barca", action }),
      ).toBe(true);
    expect(
      validWatchMessage({
        kind: "command",
        source: "f1-behind-charge",
        action: "team",
        team: "mclaren",
      }),
    ).toBe(true);
  });
  it("rejects mismatched teams, missing state, invalid clocks and unknown commands", () => {
    for (const value of [
      null,
      {},
      { ...state, team: "ferrari" },
      { ...state, position: NaN },
      { ...state, bookmarks: [-1] },
      { ...state, learningStatus: undefined },
      { kind: "command", source: "barca", action: "seek", position: 10 },
      { kind: "command", source: "barca", action: "speaking", speaking: "yes" },
    ])
      expect(validWatchMessage(value)).toBe(false);
  });
  it("isolates room names without allowing arbitrary channel identifiers", () => {
    expect(validRoom("b632d24e-3bd8-478a-b986-321fe935f8dd")).toBe(true);
    for (const id of [null, "short", "spaces are invalid", "a".repeat(65)])
      expect(validRoom(id)).toBe(false);
  });
});
