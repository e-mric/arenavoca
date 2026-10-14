import { describe, expect, it, vi } from "vitest";
import {
  RecordedStream,
  validateBatch,
  type MomentBatch,
  type AnalysisWindow,
} from "./stream";
import { MomentCards } from "../match-lab/cards";
const window = {
  sourceId: "barca-2018-full",
  startSeconds: 808,
  endSeconds: 828,
};
function batch(
  w: AnalysisWindow = window,
  id = "abcdef1234567890-0",
): MomentBatch {
  return {
    window: w,
    elapsedSeconds: 18,
    moments: [
      {
        id,
        action: "cutback",
        startSeconds: 813,
        endSeconds: 815,
        spanish: "El jugador pasa hacia atrás.",
        english: "The player passes backwards.",
        visualEvidence: "A low backward pass.",
        commentaryEvidence: "Alba passes.",
        replayPath: `api/recognition/media/1234567890abcdef/${id}.mp4`,
      },
    ],
    story: [
      {
        eventId: id,
        spanish: "El jugador pasa hacia atrás.",
        english: "The player passes backwards.",
      },
    ],
  };
}
function setup() {
  const transport = {
    start: vi.fn(async () => "session"),
    analyze: vi.fn(async (_session: string, w: AnalysisWindow) => batch(w)),
    stop: vi.fn(async () => {}),
  };
  const publish = vi.fn();
  return { transport, publish, stream: new RecordedStream(transport, publish) };
}
async function flush() {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}
function advance(
  stream: RecordedStream,
  from: number,
  to: number,
  playing = true,
) {
  for (let second = from + 1; second <= to; second++)
    stream.tick(second, playing, 1);
}
describe("recorded-as-live ingestion", () => {
  it("waits for observed footage, excludes future frames and does not analyse while paused", async () => {
    const { stream, transport, publish } = setup();
    await stream.start(808);
    advance(stream, 808, 827);
    expect(transport.analyze).not.toHaveBeenCalled();
    stream.tick(828, false, 1);
    expect(transport.analyze).not.toHaveBeenCalled();
    stream.tick(828, true, 0);
    await flush();
    expect(transport.analyze).toHaveBeenCalledWith(
      "session",
      window,
      expect.any(AbortSignal),
    );
    expect(publish).toHaveBeenCalledOnce();
  });
  it("has one in-flight request and coalesces a backlog into the latest window", async () => {
    const { stream, transport } = setup();
    let resolve!: (value: MomentBatch) => void;
    transport.analyze.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    await stream.start(808);
    advance(stream, 808, 828);
    advance(stream, 828, 858);
    expect(transport.analyze).toHaveBeenCalledTimes(1);
    resolve(batch());
    await flush();
    stream.tick(859, true, 1);
    expect(transport.analyze.mock.calls[1][1]).toEqual({
      ...window,
      startSeconds: 839,
      endSeconds: 859,
    });
    stream.stop();
  });
  it.each(["stop", "seek"])(
    "discards a late model response after %s",
    async (reason) => {
      const { stream, transport, publish } = setup();
      let resolve!: (value: MomentBatch) => void;
      transport.analyze.mockImplementationOnce(
        () =>
          new Promise((r) => {
            resolve = r;
          }),
      );
      await stream.start(808);
      advance(stream, 808, 828);
      if (reason === "stop") stream.stop();
      else stream.tick(800, true, 0.1, true);
      resolve(batch());
      await flush();
      expect(publish).not.toHaveBeenCalled();
      expect(stream.active).toBe(false);
      expect(transport.stop).toHaveBeenCalledWith("session");
    },
  );
  it("deduplicates overlapping observations and remaps story references", async () => {
    const { stream, transport, publish } = setup();
    transport.analyze.mockImplementation(async (_session, w) => {
      const b = batch(
        w,
        w.startSeconds === 808 ? "abcdef1234567890-0" : "abcdef1234567890-1",
      );
      b.moments[0].startSeconds = 825;
      b.moments[0].endSeconds = 827;
      return b;
    });
    await stream.start(808);
    advance(stream, 808, 828);
    await flush();
    advance(stream, 828, 844);
    await flush();
    expect(publish.mock.calls[1][0].moments).toEqual([]);
    expect(publish.mock.calls[1][0].story[0].eventId).toBe(
      "abcdef1234567890-0",
    );
    expect(stream.received).toBe(1);
  });
  it("stops after three windows without retrying provider failures", async () => {
    const { stream, transport } = setup();
    transport.analyze.mockImplementation(async (_session, w) => ({
      window: w,
      moments: [],
      story: [],
      elapsedSeconds: 1,
    }));
    await stream.start(808);
    for (const [from, to] of [
      [808, 828],
      [828, 844],
      [844, 860],
    ]) {
      advance(stream, from, to);
      await flush();
    }
    expect(stream.active).toBe(false);
    expect(transport.analyze).toHaveBeenCalledTimes(3);
    await stream.start(860);
    transport.analyze.mockRejectedValue(new Error("Offline"));
    advance(stream, 860, 880);
    await flush();
    advance(stream, 880, 900);
    expect(transport.analyze).toHaveBeenCalledTimes(4);
    expect(stream.status).toContain("failed");
  });
  it("releases sessions that finish opening after Stop", async () => {
    const { stream, transport } = setup();
    let resolve!: (value: string) => void;
    transport.start.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const started = stream.start(808);
    stream.stop();
    resolve("late-session");
    await started;
    expect(transport.stop).toHaveBeenCalledWith("late-session");
    expect(stream.active).toBe(false);
  });
});
describe("publishing draft evidence", () => {
  it("rejects future evidence, foreign media paths and stories with missing events", () => {
    const future = batch();
    future.moments[0].endSeconds = 830;
    expect(() => validateBatch(future, window)).toThrow();
    const foreign = batch();
    foreign.moments[0].replayPath = "https://example.com/clip.mp4";
    expect(() => validateBatch(foreign, window)).toThrow();
    const unknown = batch();
    unknown.story[0].eventId = "missing";
    expect(() => validateBatch(unknown, window)).toThrow();
    expect(() => validateBatch(batch(), window)).not.toThrow();
  });
  it("appends drafts without moving the selected card, reveal or prepared catalog", () => {
    const cards = new MomentCards();
    cards.toggleStory();
    cards.flip();
    const selected = cards.card;
    cards.append(batch());
    cards.append(batch());
    expect(cards.card).toBe(selected);
    expect(cards.flipped).toBe(true);
    expect(cards.storyMode).toBe(true);
    expect(cards.draftCount).toBe(1);
    expect(new MomentCards().count).toBe(7);
    cards.showDrafts();
    expect(cards.card.draft).toBe(true);
    expect(cards.audioId).toBeNull();
    expect(cards.artworkPath).toBe("branding/favicon.png");
    expect(cards.replayPath).toContain("api/recognition/media/");
    cards.toggleStory();
    expect(cards.label).toContain("AI draft story");
    expect(cards.spanish).toBe(batch().story[0].spanish);
  });
});
