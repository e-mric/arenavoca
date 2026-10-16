import type { Card } from "./cards";

export const MOMENT_SAVE_PREFIX = "arenavoca.saved-moment.v1/";
export const LAB_PROGRESS_KEY =
  "arenavoca.match-lab.barca-2018-full.alba-cutback.v1";
export function readLabSave(
  storage: Pick<Storage, "getItem">,
  cardId = "alba-cutback",
): boolean {
  try {
    return (
      storage.getItem(LAB_PROGRESS_KEY.replace("alba-cutback", cardId)) ===
      "saved"
    );
  } catch {
    return false;
  }
}
export function saveLabPhrase(
  storage: Pick<Storage, "setItem">,
  cardId = "alba-cutback",
  card?: Card,
): boolean {
  try {
    if (card)
      storage.setItem(
        MOMENT_SAVE_PREFIX + card.id,
        JSON.stringify({
          version: 1,
          savedAt: new Date().toISOString(),
          card,
          sourceId: card.evidence.sourceId,
          replayPath: card.context
            ? null
            : (card.replayPath ?? `media/user/${card.id}.mp4`),
          sync: "local",
        }),
      );
    storage.setItem(LAB_PROGRESS_KEY.replace("alba-cutback", cardId), "saved");
    return true;
  } catch {
    return false;
  }
}
