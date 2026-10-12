import { it, expect } from "vitest";
import { teamThemes, themeFor, teamsFor } from "./team-theme";
function luminance(hex: string) {
  const rgb = hex
    .slice(1)
    .match(/../g)!
    .map((x) => parseInt(x, 16) / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
it("keeps club and racing team choices in their own sport", () => {
  expect(teamsFor("football")).toEqual([
    "blue",
    "amber",
    "barcelona",
    "madrid",
  ]);
  expect(teamsFor("f1")).toEqual(["ferrari", "mclaren"]);
  expect(themeFor("barcelona", "f1")).toBe(teamThemes.neutral);
  expect(themeFor("ferrari", "football")).toBe(teamThemes.neutral);
});
it.each(Object.keys(teamThemes) as (keyof typeof teamThemes)[])(
  "%s preserves readable text and primary controls",
  (team) => {
    const t = teamThemes[team];
    expect(contrast(t.accent, t.accentInk)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#edf3e8", t.panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#b5c9b5", t.panel)).toBeGreaterThanOrEqual(4.5);
  },
);
