export type AtmosphereMode = "minimal" | "team";

/** Decoration responds to practice results, never to or through match playback. */
export class TeamAtmosphere {
  mode: AtmosphereMode = "team";
  remaining = 0;
  get celebrating() {
    return this.mode === "team" && this.remaining > 0;
  }
  toggle() {
    this.mode = this.mode === "team" ? "minimal" : "team";
    this.cancel();
  }
  celebrate() {
    if (this.mode === "team") this.remaining = 1.6;
  }
  cancel() {
    this.remaining = 0;
  }
  frame(delta: number) {
    if (Number.isFinite(delta) && delta > 0)
      this.remaining = Math.max(0, this.remaining - Math.min(delta, 0.1));
  }
}
