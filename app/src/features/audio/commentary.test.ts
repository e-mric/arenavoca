import { it, expect, vi, afterEach } from "vitest";
import { Commentary } from "./commentary";
afterEach(() => vi.unstubAllGlobals());
function setup() {
  const media = {
    src: "",
    preload: "",
    currentTime: 0,
    volume: 1,
    play: vi.fn(async () => {}),
    pause: vi.fn(),
    load: vi.fn(),
    addEventListener: vi.fn(),
  };
  const track = new Commentary(media);
  track.ready = true;
  return {
    track,
    media,
    video: { currentTime: 13, paused: false, ended: false },
  };
}
it("starts alternate commentary at the video's current position and corrects drift", () => {
  const { track, media, video } = setup();
  track.sync(video, "spanish", 0.22);
  expect(media.currentTime).toBe(13);
  expect(media.volume).toBe(0.22);
  expect(media.play).toHaveBeenCalledTimes(1);
  video.currentTime = 15;
  track.sync(video, "spanish", 0);
  expect(media.currentTime).toBe(15);
  expect(media.volume).toBe(0);
  expect(media.play).toHaveBeenCalledTimes(1);
});
it.each(["pause", "ended", "english"] as const)(
  "%s stops Spanish without moving the video",
  (condition) => {
    const { track, media, video } = setup();
    track.sync(video, "spanish", 1);
    if (condition === "pause") video.paused = true;
    if (condition === "ended") video.ended = true;
    track.sync(video, condition === "english" ? "english" : "spanish", 1);
    expect(media.pause).toHaveBeenCalled();
    expect(video.currentTime).toBe(13);
  },
);
it("late playback after switching away stays stopped", async () => {
  const { track, media, video } = setup();
  let resolve!: () => void;
  media.play.mockImplementationOnce(
    () =>
      new Promise<void>((r) => {
        resolve = r;
      }),
  );
  track.sync(video, "spanish", 1);
  track.sync(video, "english", 1);
  const pauses = media.pause.mock.calls.length;
  resolve();
  await Promise.resolve();
  expect(media.pause).toHaveBeenCalledTimes(pauses + 1);
});
it("rapid Spanish-English-Spanish never lets an old completion stop the current track", async () => {
  const { track, media, video } = setup();
  let resolve!: () => void;
  media.play.mockImplementationOnce(
    () =>
      new Promise<void>((r) => {
        resolve = r;
      }),
  );
  track.sync(video, "spanish", 1);
  track.sync(video, "english", 1);
  track.sync(video, "spanish", 1);
  const pauses = media.pause.mock.calls.length;
  resolve();
  await Promise.resolve();
  expect(media.pause).toHaveBeenCalledTimes(pauses);
});
it("a rejected alternate track reports failure without pausing the match", async () => {
  const { track, media, video } = setup();
  track.onError = vi.fn();
  media.play.mockRejectedValueOnce(new Error("blocked"));
  track.sync(video, "spanish", 1);
  await Promise.resolve();
  await Promise.resolve();
  expect(track.ready).toBe(false);
  expect(track.onError).toHaveBeenCalled();
  expect(video.paused).toBe(false);
});
it("preloads a nonempty local track and releases its blob on teardown", async () => {
  const { track, media } = setup();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(new Blob(["audio"]), { status: 200 })),
  );
  await track.load("audio/commentary-es.mp3");
  expect(media.src).toMatch(/^blob:/);
  expect(media.load).toHaveBeenCalled();
  const revoke = vi.spyOn(URL, "revokeObjectURL");
  track.destroy();
  expect(revoke).toHaveBeenCalled();
  revoke.mockRestore();
});
