import type { Content } from "../content/model";
import { exportRecap } from "./transfer";

export function downloadRecap(
  content: Content,
  savedPhraseIds: readonly string[],
) {
  const file = new Blob([exportRecap(content, savedPhraseIds)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "arenavoca-recap.json";
  document.body.append(link);
  link.click();
  link.remove();
  // Allow the browser to consume the download before releasing the object URL.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
