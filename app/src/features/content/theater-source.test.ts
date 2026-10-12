import { expect, it } from "vitest";
import {
  validateTheaterSource,
  theaterPracticeContent,
} from "./theater-source";
import {
  contentChunkCount,
  contentDiagramPoint,
} from "../learning/content-diagram";
const football = {
  kind: "video",
  id: "barca-demo",
  title: "Barcelona full match",
  sport: "football",
  video: "media/user/game.mp4",
} as const;
it("accepts local recordings and rejects page links, traversal and missing sport", () => {
  expect(validateTheaterSource(football)).toEqual(football);
  expect(validateTheaterSource({ kind: "sample" })).toEqual({ kind: "sample" });
  for (const raw of [
    null,
    { ...football, video: "https://youtube.com/watch?v=abc" },
    { ...football, video: "media/../secret.mp4" },
    { ...football, sport: "unknown" },
    { ...football, id: "../../bad" },
  ])
    expect(() => validateTheaterSource(raw)).toThrow();
});
it("uses the full recording duration without adding fake commentary or event detection", () => {
  const content = theaterPracticeContent(football, 5960.79);
  expect(content.duration).toBe(5960.79);
  expect(content.manualPractice).toBe(true);
  expect(content.captions).toEqual([]);
  expect(content.phrases[0].spanish).toBe("El jugador pasa el balón.");
  expect(content.version).toBe("theater-barca-demo-football");
});
it("F1 supplies a separate overtake concept, two chunks and diagram coordinates", () => {
  const content = theaterPracticeContent(
    { ...football, sport: "f1", id: "race" },
    6000,
  );
  expect(content.phrases[0].id).toBe("overtake");
  expect(content.phrases[0].spanish).toBe("El piloto adelanta.");
  expect(contentChunkCount(content, 0.5)).toBe(1);
  expect(contentChunkCount(content, 1)).toBe(2);
  expect(contentDiagramPoint(content, 0.3, 0.6)).toEqual([0.3, 0.6]);
});
it.each([NaN, Infinity, 0, 0.5, 43201])(
  "rejects unreadable or unbounded duration %s",
  (duration) => {
    expect(() => theaterPracticeContent(football, duration)).toThrow();
  },
);
