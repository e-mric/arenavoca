import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { theaterPracticeContent } from "../content/theater-source";
import { exportRecap } from "./transfer";

describe("viewing-to-mobile recap contract", () => {
  for (const sport of ["football", "f1"] as const) {
    const content = theaterPracticeContent(
      {
        kind: "video",
        id: `${sport}-demo`,
        title: sport === "f1" ? "F1 demo" : "Football demo",
        sport,
        video: "media/match.mp4",
      },
      30,
    );
    it(`exports the exact ${sport} fixture consumed by Kotlin`, () => {
      const fixture = JSON.parse(
        readFileSync(
          new URL(`./fixtures/${sport}.json`, import.meta.url),
          "utf8",
        ),
      );
      const saved = [content.phrases[0].id, "unknown", content.phrases[0].id];
      expect(JSON.parse(exportRecap(content, saved))).toEqual(fixture);
      expect(saved).toHaveLength(3);
      expect(exportRecap(content, saved)).not.toContain("media/");
    });
    it(`rejects empty or unrelated ${sport} saves`, () => {
      expect(() => exportRecap(content, [])).toThrow("Save a phrase");
      expect(() => exportRecap(content, ["unknown"])).toThrow("Save a phrase");
    });
  }
  it("labels the original sample honestly and bounds its title", () => {
    const content = theaterPracticeContent(
      {
        kind: "video",
        id: "demo",
        title: "x".repeat(150),
        sport: "football",
        video: "media/match.mp4",
      },
      30,
    );
    expect(JSON.parse(exportRecap(content, ["pass"])).title).toHaveLength(100);
    delete content.manualPractice;
    delete content.title;
    expect(JSON.parse(exportRecap(content, ["pass"]))).toMatchObject({
      example: true,
      title: "Original football sample",
    });
  });
});
