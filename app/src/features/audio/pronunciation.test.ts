import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { Pronunciation, commentaryVolume } from "./pronunciation";
let sources: any[] = [];
let resumed = 0;
class Source {
  buffer: unknown;
  onended: (() => void) | null = null;
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
  constructor() {
    sources.push(this);
  }
}
class Context {
  destination = {};
  decodeAudioData = async () => ({ duration: 1.58 });
  resume = async () => {
    resumed++;
  };
  createBufferSource = () => new Source();
  close = async () => {};
}
beforeEach(() => {
  sources = [];
  resumed = 0;
  vi.stubGlobal("AudioContext", Context);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(1),
    })),
  );
});
afterEach(() => vi.unstubAllGlobals());
it("preloading never plays Spanish automatically", async () => {
  const a = new Pronunciation();
  await a.preload("pass", "audio/pass-es.mp3");
  expect(sources.length).toBe(0);
  expect(resumed).toBe(0);
  expect(a.speaking).toBe(false);
});
it("repeated Listen restarts without overlapping voices", async () => {
  const a = new Pronunciation();
  await a.preload("pass", "audio/pass-es.mp3");
  await a.listen("pass");
  await a.listen("pass");
  expect(sources[0].stop).toHaveBeenCalledOnce();
  expect(sources[0].disconnect).toHaveBeenCalledOnce();
  expect(sources[1].start).toHaveBeenCalledOnce();
  expect(a.speaking).toBe(true);
});
it("ended and Stop restore current commentary preference", async () => {
  const a = new Pronunciation();
  await a.preload("pass", "audio/pass-es.mp3");
  await a.listen("pass");
  expect(commentaryVolume(false, a.speaking)).toBe(0.22);
  expect(commentaryVolume(true, a.speaking)).toBe(0);
  sources[0].onended();
  expect(a.speaking).toBe(false);
  expect(commentaryVolume(false, a.speaking)).toBe(1);
  await a.listen("pass");
  a.stop();
  expect(a.speaking).toBe(false);
});
it("does not resurrect audio when Stop occurs during context resume", async () => {
  let resolve!: () => void;
  class SlowContext extends Context {
    resume = () =>
      new Promise<void>((r) => {
        resolve = r;
      });
  }
  vi.stubGlobal("AudioContext", SlowContext);
  const a = new Pronunciation();
  await a.preload("pass", "audio/pass-es.mp3");
  const pending = a.listen("pass");
  a.stop();
  resolve();
  await pending;
  expect(sources.length).toBe(0);
});
it("missing pronunciation fails clearly without starting", async () => {
  const a = new Pronunciation();
  await expect(a.listen("missing")).rejects.toThrow("unavailable");
  expect(a.speaking).toBe(false);
});
it("failed fetches do not register buffers", async () => {
  vi.stubGlobal("fetch", async () => ({ ok: false }));
  const a = new Pronunciation();
  await expect(a.preload("pass", "audio/pass-es.mp3")).rejects.toThrow(
    "could not load",
  );
  expect(a.has("pass")).toBe(false);
});
