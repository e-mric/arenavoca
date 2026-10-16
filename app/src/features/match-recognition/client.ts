import { assetUrl } from "../content/model";
import type { RecognitionTransport, RecognitionConfiguration } from "./stream";
async function post(path: string, body: object, signal?: AbortSignal) {
  const response = await fetch(assetUrl(`api/recognition/${path}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) throw new Error("Recognition unavailable");
  return response.json();
}
export const localRecognition: RecognitionTransport = {
  configuration: async () => {
    const response = await fetch(assetUrl("api/recognition/configuration"), {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Recognition unavailable");
    const config: RecognitionConfiguration = await response.json();
    if (
      !config ||
      !/^[a-f0-9]{32}$/.test(config.id) ||
      typeof config.model !== "string" ||
      !config.model ||
      config.model.length > 120 ||
      !(
        (config.provider === "gemini" && config.evidence === "video-audio") ||
        (config.provider === "ollama" &&
          ["frames", "frames-transcript"].includes(config.evidence))
      )
    )
      throw new Error("Unsupported recognition service");
    return config;
  },
  start: async (position, signal, configuration) =>
    (await post("start", { position, configuration }, signal)).session,
  analyze: (session, window, signal) =>
    post("analyze", { session, window }, signal),
  stop: (session) => post("stop", { session }),
};
