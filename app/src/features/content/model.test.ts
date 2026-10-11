import { describe, it, expect } from "vitest";
import raw from "../../../public/content/match.json";
import { assetUrl, validateContent } from "./model";
const content = () => structuredClone(raw);
describe("content", () => {
  it("validates the original authored sample and accents", () => {
    expect(validateContent(content()).phrases[0].spanish).toBe(
      "El jugador pasa el balón.",
    );
  });
  it.each([
    ["duplicate ID", (c: any) => c.phrases.push(c.phrases[0])],
    ["unknown phrase", (c: any) => (c.events[0].phraseId = "missing")],
    ["unknown diagram", (c: any) => (c.events[0].diagramId = "missing")],
    [
      "overlap",
      (c: any) =>
        c.events.push({
          ...c.events[0],
          id: "other",
          promptStart: 19,
          promptEnd: 22,
        }),
    ],
    ["long window", (c: any) => (c.events[0].promptEnd = 21)],
    ["out of bounds", (c: any) => (c.diagrams[0].route[0][0] = 2)],
    ["unsafe asset", (c: any) => (c.video = "../private.mp4")],
    ["invalid caption", (c: any) => (c.captions[0].end = 40)],
    ["negative timing", (c: any) => (c.events[0].actionStart = -1)],
    ["empty route", (c: any) => (c.diagrams[0].route = [])],
    [
      "degenerate route",
      (c: any) =>
        (c.diagrams[0].route = [
          c.diagrams[0].route[0],
          c.diagrams[0].route[0],
        ]),
    ],
    ["missing review", (c: any) => delete c.phrases[0].reviewStatus],
    ["malformed metadata", (c: any) => (c.duration = "30")],
  ])("rejects %s", (_name, mutate) => {
    const c = content();
    mutate(c);
    expect(() => validateContent(c)).toThrow(/Content:/);
  });
  it("supports a nested static-host base", () =>
    expect(assetUrl("/media/match.mp4", "/football/")).toBe(
      "/football/media/match.mp4",
    ));
});
