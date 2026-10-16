import { expect, it } from "vitest";
import { ViewingSpace, viewingSessionMode } from "./viewing-space";
it("uses the same passthrough-capable session for both spaces on Quest", () => {
  expect(viewingSessionMode(true)).toBe("immersive-ar");
  expect(viewingSessionMode(false)).toBe("immersive-vr");
});
it("switches back and forth within an existing blended session", () => {
  const space = new ViewingSpace();
  expect(space.select("passthrough", "alpha-blend")).toBe(true);
  expect(space.mode).toBe("passthrough");
  expect(space.select("theater", "alpha-blend")).toBe(true);
  expect(space.mode).toBe("theater");
  expect(space.select("passthrough", "alpha-blend")).toBe(true);
});
it("does not pretend an opaque VR session can show the user's room", () => {
  const space = new ViewingSpace();
  for (const blend of [undefined, "opaque"]) {
    expect(space.select("passthrough", blend)).toBe(false);
    expect(space.mode).toBe("theater");
  }
});
