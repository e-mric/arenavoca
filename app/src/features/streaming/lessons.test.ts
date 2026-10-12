import { describe, expect, it } from "vitest";
import { sources, sourceById, youtubeUrl } from "./catalog";
import { streamLessons } from "./lessons";
import { PassTrace } from "../learning/tracing";
describe("sport content contracts", () => {
  it("labels the full match and F1 behind-the-scenes video accurately", () => {
    expect(sources[0].title).toContain("Full match");
    expect(sources[1].title).toContain("Behind the Charge");
    expect(sources[1].title).not.toContain("Full race");
    expect(sources.every((s) => /^[\w-]{11}$/.test(s.videoId))).toBe(true);
    expect(youtubeUrl(sources[0])).toContain("WMjohb2tq7Y");
    expect(sourceById("f1-miami").id).toBe("f1-behind-charge");
    expect(sourceById("unknown").id).toBe("barca");
  });
  it.each(["football", "f1"] as const)(
    "%s supplies coherent phrase chunks, media and a usable trace",
    (sport) => {
      const lesson = streamLessons[sport];
      expect(lesson.sport).toBe(sport);
      expect(lesson.chunks.join(" ") + ".").toBe(lesson.spanish);
      expect(lesson.audio).toMatch(/\.mp3$/);
      const trace = new PassTrace(lesson.route);
      trace.start();
      for (let i = 0; i <= 40; i++) {
        const [a, b] = lesson.route;
        trace.sample({
          point: [
            a[0] + ((b[0] - a[0]) * i) / 40,
            a[1] + ((b[1] - a[1]) * i) / 40,
          ],
          depth: 0,
          tracked: true,
        });
      }
      expect(trace.progress).toBe(1);
    },
  );
});
