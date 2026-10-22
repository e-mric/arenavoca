/** Optional source-timed participation. This module has no playback commands. */
export type CelebrationPhase = "idle" | "invited" | "celebrating";

export class GoalCelebration {
  enabled = false;
  phase: CelebrationPhase = "idle";
  readonly invitationSeconds = 10;
  readonly animationSeconds = 4;
  goalId = "";
  demo = false;
  age = 0;
  held = 0;
  invitationId = 0;
  private previous: number | null = null;
  private readonly seen = new Set<string>();
  private armed = false;
  private tracked = false;
  private raised = false;
  get needsFreshPose() {
    return this.phase === "invited" && !this.armed && this.raised;
  }
  constructor(
    private readonly goals: readonly { id: string; endSeconds: number }[],
  ) {}
  setEnabled(value: boolean) {
    this.enabled = value;
    if (!value) this.cancel();
  }
  tryDemo() {
    if (this.enabled) this.invite("demo", true);
  }
  update(
    time: number,
    playing: boolean,
    seeking: boolean,
    eligible: boolean,
    delta: number,
  ) {
    if (!Number.isFinite(time) || time < 0) {
      this.cancel();
      this.previous = null;
      return;
    }
    if (Number.isFinite(delta) && delta > 0) this.age += Math.min(delta, 0.1);
    if (
      (this.phase === "invited" && this.age >= this.invitationSeconds) ||
      (this.phase === "celebrating" && this.age >= this.animationSeconds)
    )
      this.cancel();
    if (seeking || (!this.demo && (!eligible || !playing))) this.cancel();
    for (const goal of this.goals) {
      if (goal.endSeconds > time || this.seen.has(goal.id)) continue;
      this.seen.add(goal.id);
      const crossed =
        this.previous !== null &&
        time > this.previous &&
        time - this.previous <= 1.5 &&
        goal.endSeconds > this.previous;
      if (this.enabled && eligible && playing && !seeking && crossed)
        this.invite(goal.id, false);
    }
    this.previous = seeking || !playing || !eligible ? null : time;
  }
  observe(raised: boolean, tracked: boolean, blocked: boolean, delta: number) {
    this.raised = raised;
    this.tracked = tracked;
    if (!tracked || blocked) {
      this.armed = false;
      this.held = 0;
      return;
    }
    if (!raised) {
      this.armed = true;
      this.held = 0;
      return;
    }
    if (
      this.phase !== "invited" ||
      !this.armed ||
      !Number.isFinite(delta) ||
      delta <= 0
    )
      return;
    this.held += Math.min(delta, 0.1);
    if (this.held >= 0.35) {
      this.phase = "celebrating";
      this.age = 0;
      this.held = 0;
    }
  }
  cancel() {
    this.phase = "idle";
    this.age = this.held = 0;
    this.goalId = "";
    this.demo = false;
    this.armed = false;
  }
  private invite(id: string, demo: boolean) {
    this.invitationId++;
    this.phase = "invited";
    this.goalId = id;
    this.demo = demo;
    this.age = this.held = 0;
    this.armed = this.tracked && !this.raised;
  }
}
