/** Tabletop coordinates in metres. Pull away from the target, then release. */
export type AimPoint = readonly [number, number, number];

export function assistedTarget(
  home: AimPoint,
  release: AimPoint,
  targets: readonly AimPoint[],
): number {
  const dx = home[0] - release[0];
  const dz = home[2] - release[2];
  const length = Math.hypot(dx, dz);
  if (
    !Number.isFinite(length) ||
    length < 0.035 ||
    length > 0.32 ||
    release[1] > 0.3 ||
    release[1] < -0.08
  )
    return -1;
  let best = Math.cos(Math.PI / 5);
  let selected = -1;
  targets.forEach((target, index) => {
    const tx = target[0] - home[0];
    const tz = target[2] - home[2];
    const distance = Math.hypot(tx, tz);
    const alignment = (dx * tx + dz * tz) / (length * distance);
    if (alignment > best) {
      best = alignment;
      selected = index;
    }
  });
  return selected;
}
