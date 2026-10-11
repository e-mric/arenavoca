import type { Point } from "../content/model";
export interface TraceSample {
  point: Point;
  tracked: boolean;
  depth: number;
}
export const TRACE_TUNING = {
  corridor: 0.09,
  maxAdvance: 0.16,
  planeDepth: 0.08,
  startRadius: 0.1,
};
export class PassTrace {
  progress = 0;
  armed = false;
  connected = false;
  hand: "left" | "right" = "right";
  constructor(readonly route: readonly Point[]) {}
  start(hand: "left" | "right" = "right") {
    this.reset();
    this.hand = hand;
    this.armed = true;
  }
  reset() {
    this.progress = 0;
    this.armed = false;
    this.connected = false;
  }
  sample({ point, tracked, depth }: TraceSample): number {
    if (
      !this.armed ||
      !tracked ||
      Math.abs(depth) > TRACE_TUNING.planeDepth ||
      !point.every(Number.isFinite)
    )
      return this.progress;
    const segments = this.route.slice(1).map((b, i) => ({
      a: this.route[i],
      b,
      length: Math.hypot(b[0] - this.route[i][0], b[1] - this.route[i][1]),
    }));
    const total = segments.reduce((sum, s) => sum + s.length, 0);
    if (!total) return this.progress;
    let offset = 0;
    let best = { distance: Infinity, progress: 0 };
    for (const s of segments) {
      if (!s.length) continue;
      const dx = s.b[0] - s.a[0],
        dy = s.b[1] - s.a[1];
      const t = Math.max(
        0,
        Math.min(
          1,
          ((point[0] - s.a[0]) * dx + (point[1] - s.a[1]) * dy) /
            (s.length * s.length),
        ),
      );
      const distance = Math.hypot(
        point[0] - s.a[0] - dx * t,
        point[1] - s.a[1] - dy * t,
      );
      if (distance < best.distance)
        best = { distance, progress: (offset + t * s.length) / total };
      offset += s.length;
    }
    if (!this.connected) {
      if (
        Math.hypot(point[0] - this.route[0][0], point[1] - this.route[0][1]) >
        TRACE_TUNING.startRadius
      )
        return this.progress;
      this.connected = true;
    }
    if (
      best.distance <= TRACE_TUNING.corridor &&
      best.progress <= this.progress + TRACE_TUNING.maxAdvance
    )
      this.progress = Math.max(this.progress, best.progress);
    if (this.progress > 0.97) {
      this.progress = 1;
      this.armed = false;
    }
    return this.progress;
  }
}
export function revealedChunks(progress: number): number {
  return progress >= 0.97 ? 3 : progress >= 0.45 ? 2 : progress > 0 ? 1 : 0;
}
export function routePoint(route: readonly Point[], progress: number): Point {
  const lengths = route
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1]));
  let remaining =
    Math.max(0, Math.min(1, progress)) * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] && lengths[i] > 0) {
      const t = remaining / lengths[i];
      return [
        route[i][0] + (route[i + 1][0] - route[i][0]) * t,
        route[i][1] + (route[i + 1][1] - route[i][1]) * t,
      ];
    }
    remaining -= lengths[i];
  }
  return route[route.length - 1];
}
