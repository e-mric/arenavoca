import { describe, expect, it } from "vitest";
import {
  ArenaReveal,
  arenaRevealProgress,
  ARENA_REVEAL_SECONDS,
} from "./arena-motion";

describe("arena welcome reveal", () => {
  it("starts flat on immersive entry and settles once without looping", () => {
    const motion = new ArenaReveal();
    motion.update(0.1, true, true);
    expect(motion.visible).toBe(true);
    expect(arenaRevealProgress(motion.elapsed)).toBe(0);
    for (let i = 0; i < 80; i++) motion.update(0.1, true, true);
    expect(motion.elapsed).toBe(ARENA_REVEAL_SECONDS);
    expect(arenaRevealProgress(motion.elapsed)).toBe(1);
  });
  it("hides when watching or exploring and resets only on a new immersive visit", () => {
    const motion = new ArenaReveal();
    motion.update(0, true, true);
    motion.update(0.1, true, true);
    motion.update(0.1, true, false);
    expect(motion.visible).toBe(false);
    expect(motion.elapsed).toBe(0.1);
    motion.update(0, false, true);
    expect(motion.visible).toBe(false);
    motion.update(0.1, true, true);
    expect(motion.elapsed).toBe(0);
  });
  it("does not skip ahead after a delayed frame or run backwards", () => {
    const motion = new ArenaReveal();
    motion.update(0, true, true);
    motion.update(30, true, true);
    expect(motion.elapsed).toBe(0.1);
    motion.update(-2, true, true);
    expect(motion.elapsed).toBe(0.1);
  });
  it("shows a stationary completed arena for reduced motion", () => {
    for (const elapsed of [0, 1, 3, 100])
      expect(arenaRevealProgress(elapsed, true)).toBe(1);
    expect(arenaRevealProgress(-1)).toBe(0);
    expect(arenaRevealProgress(2)).toBe(0.5);
    expect(arenaRevealProgress(100)).toBe(1);
  });
});
