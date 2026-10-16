/** Keep the original sample and an explicit development preview off the main XR route. */
export function hasBrowserCompanion(search: string) {
  const query = new URLSearchParams(search);
  return query.get("sample") === "1" || query.get("preview") === "1";
}
