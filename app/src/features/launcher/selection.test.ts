import { expect, it } from "vitest";
import raw from "../../../public/content/match.json";
import { validateContent } from "../content/model";
import { selectionDetails } from "./selection";
import { footballKits } from "../theme/team-theme";
const sample = validateContent(raw);
it("previews the actual kit used by the tabletop and keeps the recording explicit", () => {
  const a = selectionDetails(sample, "football", "barcelona");
  const b = selectionDetails(sample, "football", "madrid");
  expect(a.shirt).toBe(footballKits.barcelona.shirt);
  expect(b.shirt).toBe(footballKits.madrid.shirt);
  expect(a.shirt).not.toBe(b.shirt);
  expect(a.source).toContain("not the recording");
});
it("labels a racing colour preview without claiming the football footage changed", () => {
  const preview = selectionDetails(sample, "f1", "mclaren");
  expect(preview.spanish).toBe("El piloto adelanta.");
  expect(preview.source).toContain("football clip stays loaded");
  expect(preview.effect).toContain("not available yet");
});
it("offers chants only for the matching original sample and team", () => {
  expect(selectionDetails(sample, "football", "blue").chantAvailable).toBe(
    true,
  );
  expect(selectionDetails(sample, "football", "amber").chantAvailable).toBe(
    true,
  );
  expect(selectionDetails(sample, "football", "barcelona").chantAvailable).toBe(
    false,
  );
  expect(selectionDetails(sample, "f1", "mclaren").chantAvailable).toBe(false);
  expect(
    selectionDetails({ ...sample, version: "full-match" }, "football", "blue")
      .chantAvailable,
  ).toBe(false);
});
