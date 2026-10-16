/** Deterministic, authored practice; never a tracked reconstruction of the replay. */
export type TabletopAction = "pass" | "shoot";
export type PitchPoint = readonly [number, number, number];
export const receiver: PitchPoint = [-0.29, 0.035, 0.11];
export const goal: PitchPoint = [0.59, 0.045, 0];
export const passStart: PitchPoint = [0.24, 0.035, 0.16];
export class TabletopPractice {
  active = false;
  action: TabletopAction = "pass";
  phase: "ready" | "aiming" | "moving" | "feedback" = "ready";
  translation = false;
  success = false;
  motion = 0;
  revision = 0;
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
    return this.action === "pass" ? passStart : receiver;
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
    this.reset();
  }
  close() {
    this.active = false;
    this.phase = "ready";
    this.revision++;
  }
  reset() {
    if (!this.active) return;
    this.phase = "ready";
    this.translation = false;
    this.success = false;
    this.motion = 0;
    this.from = this.to = this.home;
    this.revision++;
    this.message =
      "Pinch and move the ball to a target, or select its coral ring then the teammate or goal.";
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
    if (near(receiver)) this.submit("teammate", point);
    else if (near(goal)) this.submit("goal", point);
    else this.miss();
  }
  private miss() {
    this.phase = "feedback";
    this.success = false;
    this.from = this.to = this.home;
    this.message =
      "Outside the target. Reset the ball and try again; translation is available.";
  }
  private submit(target: "teammate" | "goal", from: PitchPoint) {
    this.success = target === (this.action === "pass" ? "teammate" : "goal");
    this.from = from;
    this.to = target === "teammate" ? receiver : goal;
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
      this.message = this.success
        ? this.action === "pass"
          ? "¡Bien! A backward pass, away from the coral goal. Now try a shot."
          : "¡Gol! Your shot reached the goal. Pass and shot complete."
        : this.action === "pass"
          ? "That was a shot. Hacia atrás means back, towards your teammate."
          : "That was a pass. A portería means towards the goal.";
    }
  }
}
