import { it, expect, vi } from "vitest";
import moments from "../stories/content/barca-2018-opening.json";
import raw from "../../../public/content/match.json";
const capture = vi.hoisted(() =>
  vi.fn(async () => ({ Example: { normal: { chars: [] } } })),
);
vi.mock("@pmndrs/uikit", () => ({
  TTFLoader: class {
    loadAsync = capture;
  },
}));
import { SPATIAL_CHARSET, loadCompanionFont } from "./font";
it("covers every character in Spanish, captions, and dynamic punctuation", () => {
  for (const text of [
    ...moments.cards.map((card) => card.spanish),
    ...moments.stories.flatMap((story) => story.sceneSpanish),
    raw.phrases[0].spanish,
    ...raw.captions.map((c) => c.text),
    "BLUE 0-0 AMBER | …",
  ])
    for (const glyph of text) expect(SPATIAL_CHARSET).toContain(glyph);
});
it("loads one local atlas with accents before applying it to spatial panels", async () => {
  const families = await loadCompanionFont();
  expect(capture).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({
        url: expect.stringContaining("fonts/Atkinson"),
        charset: expect.stringContaining("ó"),
      }),
    ]),
  );
  expect(families.Atkinson["400"]).toEqual(families.Atkinson.normal);
});
