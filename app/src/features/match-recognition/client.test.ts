import { afterEach, expect, it, vi } from "vitest";
import { localRecognition } from "./client";
const config = {
  id: "a".repeat(32),
  provider: "ollama",
  model: "qwen3-vl:8b",
  evidence: "frames",
};
afterEach(() => vi.unstubAllGlobals());
it("loads public configuration, then binds Start to the disclosed service", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(config)))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ session: "session" })),
    );
  vi.stubGlobal("fetch", fetch);
  expect(await localRecognition.configuration()).toEqual(config);
  const signal = new AbortController().signal;
  expect(await localRecognition.start(808, signal, config.id)).toBe("session");
  expect(fetch.mock.calls[0][0]).toBe("/api/recognition/configuration");
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
    position: 808,
    configuration: config.id,
  });
});
it.each([
  null,
  { ...config, provider: "unknown" },
  { ...config, evidence: "video-audio" },
  { ...config, provider: "gemini" },
  { ...config, id: "stale" },
])("rejects misleading configuration: %j", async (value) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(value))),
  );
  await expect(localRecognition.configuration()).rejects.toThrow();
});
it("keeps an unavailable service inactive", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("", { status: 503 })),
  );
  await expect(localRecognition.configuration()).rejects.toThrow();
});
