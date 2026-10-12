import { it, expect } from "vitest";
import { activeWord, chantAt, demoChants } from "./karaoke";
it("only shows the selected team's chant when explicitly enabled", () => {
  expect(chantAt(22, "blue", true, "prototype-pass-v1")?.words).toContain(
    "azul.",
  );
  expect(chantAt(22, "amber", true, "prototype-pass-v1")?.words).toContain(
    "ámbar.",
  );
  expect(chantAt(22, "neutral", true, "prototype-pass-v1")).toBeUndefined();
  expect(chantAt(22, "blue", false, "prototype-pass-v1")).toBeUndefined();
  expect(chantAt(22, "blue", true, "another-match")).toBeUndefined();
});
it("follows the video's timeline across pause, seek, restart and cue boundaries", () => {
  const first = demoChants[0];
  expect(chantAt(21, "blue", true, "prototype-pass-v1")).toBe(first);
  expect(activeWord(first, 21)).toBe(0);
  expect(activeWord(first, 22.5)).toBe(1);
  expect(activeWord(first, 22.5)).toBe(1);
  expect(activeWord(first, 23.9)).toBe(2);
  expect(activeWord(first, 24)).toBe(-1);
  expect(chantAt(24, "blue", true, "prototype-pass-v1")?.words[0]).toBe(
    "Juntos",
  );
  expect(chantAt(27, "blue", true, "prototype-pass-v1")).toBeUndefined();
  expect(chantAt(0, "blue", true, "prototype-pass-v1")).toBeUndefined();
});
