import { it, expect } from "vitest";
import raw from "../../../public/content/match.json";
import { validateContent } from "../content/model";
import { Exposure, timelineAt } from "./timeline";
const content = validateContent(raw);
it("shows only the authored replay window using half-open boundaries", () => {
  expect(timelineAt(content, 11.99).event).toBeUndefined();
  expect(timelineAt(content, 12).event?.id).toBe("pass-01");
  expect(timelineAt(content, 19.99).event).toBeDefined();
  expect(timelineAt(content, 20).event).toBeUndefined();
});
it("pause leaves the same event and caption at the same position", () =>
  expect(timelineAt(content, 13)).toEqual(timelineAt(content, 13)));
it("hiding prompts preserves caption timing", () => {
  expect(timelineAt(content, 13, true).event).toBeUndefined();
  expect(timelineAt(content, 13, true).caption).toContain("Replay");
});
it("resume and repeated updates do not duplicate exposure", () => {
  const seen = new Exposure(["pass-01"], ["pass"]);
  expect(seen.display(content.events[0])).toBe(false);
  expect(seen.events.size).toBe(1);
  expect(seen.phrases.size).toBe(1);
  seen.restart();
  expect(seen.display(content.events[0])).toBe(true);
});
it("has no backlog after the window", () =>
  expect(timelineAt(content, 22).event).toBeUndefined());
