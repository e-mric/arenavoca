/** Palm-up reveals a persistent menu; dismissal is always an explicit action. */
export class GestureMenu {
  visible = false;
  more = false;
  private held = 0;
  private requirePalmAway = false;
  observe(palmUp: boolean, tracked: boolean, delta: number) {
    if (!Number.isFinite(delta) || delta <= 0) return;
    if (!tracked) {
      this.held = 0;
      return;
    }
    if (!palmUp) {
      this.held = 0;
      this.requirePalmAway = false;
      return;
    }
    if (this.visible || this.requirePalmAway) return;
    this.held += Math.min(delta, 0.1);
    if (this.held >= 0.35) this.visible = true;
  }
  toggle() {
    if (this.visible) this.hide();
    else {
      this.visible = true;
      this.more = false;
      this.held = 0;
    }
  }
  hide() {
    this.visible = this.more = false;
    this.held = 0;
    // Closing while the palm is still up must not immediately reopen the menu.
    this.requirePalmAway = true;
  }
}
