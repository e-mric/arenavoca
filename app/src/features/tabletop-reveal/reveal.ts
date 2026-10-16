export type Point = { x: number; y: number; z: number };
export type TablePlacement = Point & {
  yaw: number;
  source: "surface" | "calibrated" | "manual";
};
export type RestCandidate = TablePlacement & { key: unknown };
/** Pure intent state: a held pose places once; losing hands never moves a placed board. */
export class TabletopReveal {
  placement: TablePlacement | null = null;
  progress = 0;
  calibrating = false;
  private candidate: RestCandidate | null = null;
  private blocked = false;
  private away = 0;
  private labWasOpen = false;
  /** Opening can emit intermediate notifications while stopping pronunciation.
   * Only an observed open -> closed transition clears a placed board. */
  syncLab(open: boolean) {
    if (this.labWasOpen && !open && this.placement) this.close();
    this.labWasOpen = open;
  }
  get waitingForHandsAway() {
    return this.blocked;
  }
  calibrate() {
    this.placement = null;
    this.blocked = false;
    this.away = 0;
    this.calibrating = true;
    this.progress = 0;
    this.candidate = null;
  }
  close() {
    this.placement = null;
    this.progress = 0;
    this.candidate = null;
    this.calibrating = false;
    this.blocked = true;
    this.away = 0;
  }
  manual(p: TablePlacement) {
    this.placement = { ...p, source: "manual" };
    this.progress = 0;
    this.calibrating = false;
    this.candidate = null;
  }
  observe(candidate: RestCandidate | null, handsAway: boolean, delta: number) {
    if (this.placement) return false;
    if (!Number.isFinite(delta) || delta <= 0) return false;
    const dt = Math.min(delta, 0.1);
    if (this.blocked) {
      // Tracking loss is not proof the hands deliberately left the surface.
      this.away = handsAway ? this.away + dt : 0;
      if (this.away >= 0.3) this.blocked = false;
      return false;
    }
    if (
      !candidate ||
      ![candidate.x, candidate.y, candidate.z, candidate.yaw].every(
        Number.isFinite,
      )
    ) {
      this.progress = 0;
      this.candidate = null;
      return false;
    }
    const previous = this.candidate;
    if (
      !previous ||
      previous.key !== candidate.key ||
      Math.abs(
        Math.atan2(
          Math.sin(previous.yaw - candidate.yaw),
          Math.cos(previous.yaw - candidate.yaw),
        ),
      ) > 0.12 ||
      Math.hypot(
        previous.x - candidate.x,
        previous.y - candidate.y,
        previous.z - candidate.z,
      ) > 0.025
    ) {
      this.candidate = { ...candidate };
      this.progress = 0;
      return false;
    }
    this.progress = Math.min(1, this.progress + dt / 0.8);
    if (this.progress < 1) return false;
    this.placement = {
      x: previous.x,
      y: previous.y,
      z: previous.z,
      yaw: previous.yaw,
      source: previous.source,
    };
    this.calibrating = false;
    return true;
  }
}
export function restingHands(left: Point, right: Point) {
  const distance = Math.hypot(left.x - right.x, left.z - right.z);
  return (
    Math.abs(left.y - right.y) < 0.035 && distance >= 0.18 && distance <= 0.65
  );
}
/** Point membership in a detected surface outline. */
export function pointInside(
  x: number,
  z: number,
  polygon: readonly { x: number; z: number }[],
) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i],
      b = polygon[j];
    if (
      a.z > z !== b.z > z &&
      x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x
    )
      inside = !inside;
  }
  return inside;
}
