/** A one-shot logo reveal; this clock never reads or controls match media. */
export const ARENA_REVEAL_SECONDS = 4;

export function arenaRevealProgress(elapsed: number, reducedMotion = false) {
  if (reducedMotion) return 1;
  const t = Math.min(1, Math.max(0, elapsed / ARENA_REVEAL_SECONDS));
  return t * t * (3 - 2 * t);
}

/** Presentation state only: intentionally has no player or session dependency. */
export class ArenaReveal {
  elapsed = 0;
  visible = false;
  private entered = false;

  update(delta: number, immersive: boolean, onboarding: boolean) {
    if (!immersive) {
      this.entered = false;
      this.elapsed = 0;
    } else if (!this.entered) {
      this.entered = true;
      this.elapsed = 0;
    } else if (onboarding) {
      this.elapsed = Math.min(
        ARENA_REVEAL_SECONDS,
        this.elapsed + Math.max(0, Math.min(delta, 0.1)),
      );
    }
    this.visible = immersive && onboarding;
  }
}
