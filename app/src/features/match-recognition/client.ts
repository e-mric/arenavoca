import { assetUrl } from "../content/model";
import type { RecognitionTransport } from "./stream";
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
  start: async (position, signal) =>
    (await post("start", { position }, signal)).session,
  analyze: (session, window, signal) =>
    post("analyze", { session, window }, signal),
  stop: (session) => post("stop", { session }),
};
