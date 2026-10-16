export type TimedMoment = {
  id: string;
  evidence: { sourceId: string; startSeconds: number; endSeconds: number };
};
/** Recording seconds, never the broadcast clock or wall time. No playback commands. */
export class MomentArrival {
  readonly available: string[] = [];
  readonly pending: string[] = [];
  private readonly seen = new Set<string>();
  private previous: number | null = null;
  private readonly schedule: TimedMoment[];
  constructor(moments: readonly TimedMoment[], sourceId: string) {
    this.schedule = moments
      .filter((m) => m.evidence.sourceId === sourceId)
      .sort((a, b) => a.evidence.endSeconds - b.evidence.endSeconds);
  }
  observe(time: number, playing: boolean, seeking = false): string | null {
    if (!Number.isFinite(time) || time < 0) return null;
    if (seeking) {
      this.previous = null;
      return null;
    }
    let arrival: string | null = null;
    for (const moment of this.schedule) {
      const end = moment.evidence.endSeconds;
      if (end > time || this.seen.has(moment.id)) continue;
      this.seen.add(moment.id);
      this.available.push(moment.id);
      // A seek/resume unlocks history quietly. Only a nearby completed action arrives.
      const crossed =
        this.previous !== null &&
        time >= this.previous &&
        time - this.previous <= 3 &&
        end > this.previous;
      if (playing && (crossed || time - end <= 3)) {
        this.pending.push(moment.id);
        arrival ??= moment.id;
      }
    }
    this.previous = time;
    return arrival;
  }
  read(id: string) {
    const index = this.pending.indexOf(id);
    if (index >= 0) this.pending.splice(index, 1);
  }
  next(current: string, direction: -1 | 1): string | undefined {
    const index = this.available.indexOf(current);
    return this.available[
      (index + direction + this.available.length) % this.available.length
    ];
  }
  get newest() {
    return this.available[this.available.length - 1];
  }
}
