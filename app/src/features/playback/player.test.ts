import { it, expect, vi, afterEach } from "vitest";
import { MatchPlayer } from "./player";
class Video extends EventTarget {
  playsInline = false;
  preload = "";
  controls = true;
  currentTime = 0;
  paused = true;
  ended = false;
  src = "";
  fail = false;
  play = vi.fn(async () => {
    this.paused = false;
  });
  pause = () => {
    this.paused = true;
  };
  load = () =>
    queueMicrotask(() =>
      this.dispatchEvent(new Event(this.fail ? "error" : "loadeddata")),
    );
  removeAttribute = () => {
    this.src = "";
  };
}
afterEach(() => vi.unstubAllGlobals());
it("fetches the entire clip before using a local Blob URL", async () => {
  const video = new Video();
  const p = new MatchPlayer(video as unknown as HTMLVideoElement);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, blob: async () => new Blob(["clip"]) })),
  );
  await p.load("media/match.mp4");
  expect(video.src).toMatch(/^blob:/);
  expect(video.playsInline).toBe(true);
  await p.play();
  expect(p.playing).toBe(true);
  p.pause();
  expect(p.playing).toBe(false);
  video.currentTime = 13;
  p.restore(10);
  expect(p.position).toBe(10);
  p.restart();
  expect(p.position).toBe(0);
  p.destroy();
});
it("rejects a failed or empty clip before Start", async () => {
  const p = new MatchPlayer(new Video() as unknown as HTMLVideoElement);
  vi.stubGlobal("fetch", async () => ({ ok: false }));
  await expect(p.load("media/match.mp4")).rejects.toThrow("could not load");
  vi.stubGlobal("fetch", async () => ({
    ok: true,
    blob: async () => new Blob([]),
  }));
  await expect(p.load("media/match.mp4")).rejects.toThrow("empty");
});
it("reports unsupported video decoding", async () => {
  const video = new Video();
  video.fail = true;
  const p = new MatchPlayer(video as unknown as HTMLVideoElement);
  vi.stubGlobal("fetch", async () => ({
    ok: true,
    blob: async () => new Blob(["clip"]),
  }));
  await expect(p.load("media/match.mp4")).rejects.toThrow("could not play");
  p.destroy();
});
it("streams a full recording with metadata preload instead of allocating a full-match Blob", async () => {
  const video = new Video();
  const player = new MatchPlayer(video as unknown as HTMLVideoElement);
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  await player.loadStream("media/user/game.mp4");
  expect(fetcher).not.toHaveBeenCalled();
  expect(video.src).toContain("media/user/game.mp4");
  expect(video.preload).toBe("metadata");
  expect(video.src).not.toMatch(/^blob:/);
  player.destroy();
});
