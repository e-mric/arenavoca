import { describe, it, expect } from "vitest";
import { TabletopPractice, receiver, goal } from "./tabletop";
const finish = (p: TabletopPractice) => {
  for (let i = 0; i < 8; i++) p.frame(0.1);
};
describe("tabletop Spanish actions", () => {
  it("requires ball selection and finishes a backward pass then a shot", () => {
    const p = new TabletopPractice();
    p.start();
    p.choose("goal");
    expect(p.phase).toBe("ready");
    p.pickBall();
    p.choose("teammate");
    p.primary();
    expect(p.phase).toBe("moving");
    finish(p);
    expect(p.success).toBe(true);
    p.primary();
    expect(p.action).toBe("shoot");
    p.pickBall();
    p.choose("goal");
    finish(p);
    expect(p.message).toContain("¡Gol!");
    p.primary();
    expect(p.action).toBe("pass");
    expect(p.translation).toBe(false);
  });
  it("does not reward the wrong action and allows retry", () => {
    const p = new TabletopPractice();
    p.start();
    p.pickBall();
    p.choose("goal");
    finish(p);
    expect(p.success).toBe(false);
    p.primary();
    expect(p.action).toBe("pass");
    p.pickBall();
    p.release(receiver);
    finish(p);
    expect(p.success).toBe(true);
    p.primary();
    p.pickBall();
    p.release(goal);
    finish(p);
    expect(p.success).toBe(true);
  });
  it.each([
    [NaN, 0, 0],
    [receiver[0], 1, receiver[2]],
    [0, 0.03, -0.32],
  ])("rejects invalid and off-target hand releases %j", (x, y, z) => {
    const p = new TabletopPractice();
    p.start();
    p.pickBall();
    p.release([x, y, z]);
    expect(p.phase).toBe("feedback");
    expect(p.success).toBe(false);
  });
  it("closing cancels held input and stale release; start resets progress", () => {
    const p = new TabletopPractice();
    p.start();
    p.pickBall();
    p.close();
    p.release(receiver);
    p.choose("teammate");
    p.frame(0.1);
    expect(p.active).toBe(false);
    expect(p.phase).toBe("ready");
    p.start();
    expect(p.to).toEqual(p.home);
  });
  it("ignores non-finite or negative frame time and caps delayed frames", () => {
    const p = new TabletopPractice();
    p.start();
    p.pickBall();
    p.choose("teammate");
    p.frame(NaN);
    p.frame(-1);
    expect(p.motion).toBe(0);
    p.frame(100);
    expect(p.motion).toBeLessThan(0.2);
  });
});
