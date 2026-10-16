import { expect, it } from "vitest";
import { hasBrowserCompanion } from "./route";
it("keeps the flat companion out of the main website flow", () => {
  for (const query of ["", "?source=barca", "?sample=0", "?preview=false"]) {
    expect(hasBrowserCompanion(query)).toBe(false);
  }
});
it("preserves the original sample and explicit development preview", () => {
  expect(hasBrowserCompanion("?sample=1")).toBe(true);
  expect(hasBrowserCompanion("?preview=1")).toBe(true);
});
