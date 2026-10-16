import { TeamAtmosphere } from "./atmosphere";
import { assistedTarget } from "./tabletop-aim";
/** Deterministic, authored practice; never a tracked reconstruction of the replay. */
export type TabletopAction = "pass" | "shoot";
export type PitchPoint = readonly [number, number, number];
export const receiver: PitchPoint = [-0.29, 0.035, 0.11];
export const goal: PitchPoint = [0.59, 0.045, 0];
export const passStart: PitchPoint = [0.24, 0.035, 0.16];
export class TabletopPractice {
  readonly atmosphere = new TeamAtmosphere();
  active = false;
  action: TabletopAction = "pass";
  phase: "ready" | "aiming" | "moving" | "feedback" = "ready";
  translation = false;
  success = false;
  motion = 0;
  revision = 0;
  source: PitchPoint = passStart;
  receiver: PitchPoint = receiver;
  from: PitchPoint = passStart;
  to: PitchPoint = passStart;
  message = "";
  get spanish() {
    return this.action === "pass"
      ? "Pasa el balón hacia atrás."
      : "Dispara a portería.";
  }
  get english() {
    return this.action === "pass" ? "Pass the ball back." : "Shoot at goal.";
  }
  get home(): PitchPoint {
    return this.action === "pass" ? this.source : this.receiver;
  }
  get primaryLabel() {
    return this.phase === "feedback" && this.success
      ? this.action === "pass"
        ? "Next: shoot"
        : "Play again"
      : "Reset ball";
  }
  start() {
    this.active = true;
    this.action = "pass";
    this.source = passStart;
    this.receiver = receiver;
    this.reset();
  }
  close() {
    this.atmosphere.cancel();
    this.active = false;
    this.phase = "ready";
    this.revision++;
  }
  reset() {
    if (!this.active) return;
    this.atmosphere.cancel();
    this.phase = "ready";
    this.translation = false;
    this.success = false;
    this.motion = 0;
    this.from = this.to = this.home;
    this.revision++;
    this.message =
      "Pull the ball away from your target, then release. Or select its ring, then a target.";
  }
  pickBall() {
    if (!this.active || (this.phase !== "ready" && this.phase !== "aiming"))
      return false;
    this.phase = "aiming";
    this.message = "Ball selected. Choose the teammate or the coral goal.";
    return true;
  }
  choose(target: "teammate" | "goal") {
    if (!this.active || this.phase !== "aiming") return;
    this.submit(target, this.home);
  }
  release(point: PitchPoint) {
    if (!this.active || this.phase !== "aiming") return;
    if (!point.every(Number.isFinite) || point[1] < -0.08 || point[1] > 0.3) {
      this.miss();
      return;
    }
    const near = (p: PitchPoint) =>
      Math.hypot(point[0] - p[0], point[2] - p[2]) < 0.16;
    // A direct placement remains an accessible alternative to pulling back.
    if (this.action === "pass" && near(this.receiver))
      this.submit("teammate", this.home);
    else if (near(goal)) this.submit("goal", this.home);
    else {
      const target = this.aim(point);
      if (target) this.submit(target, this.home);
      else if (
        Math.hypot(point[0] - this.home[0], point[2] - this.home[2]) < 0.035
      ) {
        this.phase = "ready";
        this.message = "Pull back a little further, then release.";
      } else this.miss();
    }
  }
  aim(point: PitchPoint): "teammate" | "goal" | undefined {
    const targets = this.action === "pass" ? [this.receiver, goal] : [goal];
    const index = assistedTarget(this.home, point, targets);
    return index < 0
      ? undefined
      : this.action === "pass" && index === 0
        ? "teammate"
        : "goal";
  }
  movePlayer(kind: "source" | "receiver", point: PitchPoint) {
    if (!this.active || this.phase !== "ready" || !point.every(Number.isFinite))
      return false;
    // Keep figures inside the pitch and apart; out-of-bounds releases return home.
    const other = kind === "source" ? this.receiver : this.source;
    if (
      Math.abs(point[0]) > 0.48 ||
      Math.abs(point[2]) > 0.26 ||
      point[1] < -0.08 ||
      point[1] > 0.3 ||
      Math.hypot(point[0] - other[0], point[2] - other[2]) < 0.16
    )
      return false;
    this[kind] = [point[0], 0.035, point[2]];
    this.from = this.to = this.home;
    return true;
  }
  private miss() {
    this.phase = "feedback";
    this.success = false;
    this.from = this.to = this.home;
    this.message =
      "Outside the target. Reset the ball and try again; translation is available.";
  }
  private submit(target: "teammate" | "goal", from: PitchPoint) {
    this.success =
      target === (this.action === "pass" ? "teammate" : "goal") &&
      (this.action !== "pass" || this.receiver[0] < this.source[0] - 0.08);
    this.from = from;
    this.to = target === "teammate" ? this.receiver : goal;
    this.motion = 0;
    this.phase = "moving";
    this.message = target === "teammate" ? "Passing…" : "Shooting…";
  }
  primary() {
    if (!this.active || this.phase === "moving") return;
    if (this.phase === "feedback" && this.success)
      this.action = this.action === "pass" ? "shoot" : "pass";
    this.reset();
  }
  frame(delta: number) {
    if (this.active) this.atmosphere.frame(delta);
    if (
      !this.active ||
      this.phase !== "moving" ||
      !Number.isFinite(delta) ||
      delta <= 0
    )
      return;
    this.motion = Math.min(1, this.motion + Math.min(delta, 0.1) / 0.65);
    if (this.motion === 1) {
      this.phase = "feedback";
      if (this.success) this.atmosphere.celebrate();
      this.message = this.success
        ? this.action === "pass"
          ? "¡Bien! A backward pass, away from the coral goal. Now try a shot."
          : "¡Gol! Your shot reached the goal. Pass and shot complete."
        : this.action === "pass"
          ? "Hacia atrás means backwards. Move your teammate away from the goal, then pass."
          : "That was a pass. A portería means towards the goal.";
    }
  }
}
