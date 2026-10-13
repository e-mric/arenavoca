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
): boolean {
  try {
    storage.setItem(LAB_PROGRESS_KEY.replace("alba-cutback", cardId), "saved");
    return true;
  } catch {
    return false;
  }
}
