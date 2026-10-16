/** Deliberate palm reveal with hysteresis; tracking loss never leaves a menu stranded. */
export class GestureMenu {
  visible = false;
  more = false;
  private held = 0;
  private away = 0;
  observe(palmUp: boolean, tracked: boolean, delta: number) {
    if (!Number.isFinite(delta) || delta <= 0) return;
    const dt = Math.min(Math.max(delta, 0), 0.1);
    if (!tracked) {
      this.held = 0;
      this.away += dt;
      if (this.away >= 0.7) this.hide();
      return;
    }
    if (palmUp) {
      this.away = 0;
      this.held += dt;
      if (this.held >= 0.35) this.visible = true;
    } else {
      this.held = 0;
      this.away += dt;
      if (this.away >= 0.45) this.hide();
    }
  }
  toggle() {
    this.visible = !this.visible;
    this.more = false;
    this.held = this.away = 0;
  }
  hide() {
    this.visible = this.more = false;
    this.held = this.away = 0;
  }
}
