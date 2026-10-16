/** One quiet invitation, never a queue of animated popups. */
export class MomentNotice {
  revision = 0;
  age = 6;
  update(revision: number, delta: number) {
    if (revision !== this.revision) {
      this.revision = revision;
      this.age = 0;
    } else if (Number.isFinite(delta) && delta > 0) this.age += delta;
  }
  dismiss() {
    this.age = 6;
  }
  get visible() {
    return this.revision > 0 && this.age < 6;
  }
  scale(reduced: boolean) {
    if (reduced) return 1;
    const t = Math.min(1, this.age / 0.65) - 1;
    return 1 + 2.1 * t * t * t + 1.1 * t * t;
  }
  rise(reduced: boolean) {
    return reduced ? 0 : -0.035 * Math.pow(1 - Math.min(1, this.age / 0.65), 3);
  }
}
