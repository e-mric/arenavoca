/** Keep text and video proportional, with recoverable positive dimensions. */
export function windowScale(value: number, min = 0.45, max = 2.2) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : 1;
}
export function resizedScale(
  initial: number,
  startDistance: number,
  distance: number,
) {
  if (startDistance < 0.05 || !Number.isFinite(distance)) return initial;
  return windowScale((initial * distance) / startDistance);
}
/** Hysteresis prevents the translation flickering when a card is edge-on. */
export function cardBackFacing(dot: number, previous: boolean) {
  return dot < -0.18 ? true : dot > 0.18 ? false : previous;
}
