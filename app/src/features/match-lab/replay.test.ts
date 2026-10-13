import { expect, it, vi } from "vitest";
import { LabReplay } from "./replay";
function setup() {
  const listeners: Record<string, () => void> = {};
  const video = {
    src: "",
    currentTime: 0,
    muted: false,
    playsInline: false,
    preload: "",
    dataset: {},
    play: vi.fn(async () => {}),
    pause: vi.fn(),
    load: vi.fn(),
    remove: vi.fn(),
    removeAttribute: vi.fn(),
    getAttribute: () => video.src,
    addEventListener: (name: string, cb: () => void) => {
      listeners[name] = cb;
    },
  };
  return {
    video,
    listeners,
    replay: new LabReplay(video as unknown as HTMLVideoElement),
  };
}
it("plays only a bounded silent derivative, switches sources and resets on explicit replay", async () => {
  const { video, replay } = setup();
  await replay.play("alba-cutback");
  expect(video.src).toContain("/media/user/alba-cutback.mp4");
  expect(video.muted).toBe(true);
  video.currentTime = 2;
  await replay.play("bale-run");
  expect(video.currentTime).toBe(0);
  expect(video.src).toContain("bale-run.mp4");
  replay.stop();
  expect(video.pause).toHaveBeenCalled();
  expect(replay.visible).toBe(false);
});
it("closing during a pending play prevents a late replay from continuing", async () => {
  const { video, replay } = setup();
  let resolve!: () => void;
  video.play.mockImplementation(
    () =>
      new Promise<void>((r) => {
        resolve = r;
      }),
  );
  const p = replay.play();
  replay.stop();
  resolve();
  await p;
  expect(video.pause).toHaveBeenCalledTimes(2);
  expect(replay.visible).toBe(false);
});
it("missing replay media leaves a useful recovery message", async () => {
  const { video, replay } = setup();
  video.play.mockRejectedValue(new Error());
  await replay.play();
  expect(replay.visible).toBe(false);
  expect(replay.status).toContain("teaching board");
});
