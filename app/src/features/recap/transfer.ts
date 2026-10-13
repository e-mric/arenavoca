import type { Content } from "../content/model";

/** Portable saved-phrase selection. Never includes footage, paths or playback commands. */
export function exportRecap(
  content: Content,
  savedPhraseIds: readonly string[],
): string {
  const phraseIds = content.phrases
    .filter((phrase) => savedPhraseIds.includes(phrase.id))
    .map((phrase) => phrase.id);
  if (!phraseIds.length)
    throw new Error("Save a phrase before exporting your recap.");
  return JSON.stringify(
    {
      kind: "arenavoca-recap",
      version: 1,
      sourceId: content.version,
      title: (content.title ?? "Original football sample").slice(0, 100),
      sport: content.sport ?? "football",
      phraseIds,
      example: !content.manualPractice,
    },
    null,
    2,
  );
}
