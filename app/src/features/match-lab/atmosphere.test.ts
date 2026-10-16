import { describe, it, expect } from "vitest";
import { TabletopPractice } from "./tabletop";
const finish = (p: TabletopPractice) => {
  for (let i = 0; i < 8; i++) p.frame(0.1);
};
describe("optional team atmosphere", () => {
  it("celebrates only a completed correct action and expires once", () => {
    const p = new TabletopPractice();
    p.start();
    p.pickBall();
    p.choose("teammate");
    expect(p.atmosphere.celebrating).toBe(false);
    finish(p);
    expect(p.atmosphere.celebrating).toBe(true);
    for (let i = 0; i < 40; i++) p.frame(0.1);
    expect(p.atmosphere.celebrating).toBe(false);
    expect(p.phase).toBe("feedback");
  });
  it("never celebrates wrong actions", () => {
    const p = new TabletopPractice();
    p.start();
    p.pickBall();
    p.choose("goal");
    finish(p);
    expect(p.atmosphere.celebrating).toBe(false);
  });
  it("minimal cancels a burst; re-enabling team mode does not replay it or reset learning", () => {
    const p = new TabletopPractice();
    p.start();
    p.translation = true;
    p.pickBall();
    p.choose("teammate");
    finish(p);
    p.atmosphere.toggle();
    expect(p.atmosphere.celebrating).toBe(false);
    expect(p.atmosphere.mode).toBe("minimal");
    expect(p.translation).toBe(true);
    expect(p.success).toBe(true);
    p.atmosphere.toggle();
    expect(p.atmosphere.celebrating).toBe(false);
  });
  it("remembers minimal during this session and still permits successful practice", () => {
    const p = new TabletopPractice();
    p.start();
    p.atmosphere.toggle();
    p.close();
    p.start();
    expect(p.atmosphere.mode).toBe("minimal");
    p.pickBall();
    p.choose("teammate");
    finish(p);
    expect(p.success).toBe(true);
    expect(p.atmosphere.celebrating).toBe(false);
  });
  it("reset and closing clear celebration, and invalid time cannot corrupt it", () => {
    const p = new TabletopPractice();
    p.start();
    p.pickBall();
    p.choose("teammate");
    finish(p);
    const before = p.atmosphere.remaining;
    p.frame(NaN);
    p.frame(-1);
    expect(p.atmosphere.remaining).toBe(before);
    p.primary();
    expect(p.atmosphere.remaining).toBe(0);
    p.pickBall();
    p.choose("goal");
    finish(p);
    expect(p.atmosphere.celebrating).toBe(true);
    p.close();
    expect(p.atmosphere.remaining).toBe(0);
  });
});
