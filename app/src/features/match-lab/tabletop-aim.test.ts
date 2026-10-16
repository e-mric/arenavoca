import { describe, it, expect } from "vitest";
import { TabletopPractice, goal, passStart, receiver } from "./tabletop";
import { assistedTarget } from "./tabletop-aim";
const finish = (p: TabletopPractice) => {
  for (let i = 0; i < 8; i++) p.frame(0.1);
};
describe("assisted tabletop gestures", () => {
  it("aims opposite the pull and tolerates small hand jitter", () => {
    expect(
      assistedTarget(passStart, [0.36, 0.04, 0.18], [receiver, goal]),
    ).toBe(0);
    expect(assistedTarget(receiver, [-0.41, 0.04, 0.125], [goal])).toBe(0);
    expect(assistedTarget(passStart, [0.24, 0.04, 0.3], [receiver, goal])).toBe(
      -1,
    );
  });
  it("does not shoot on a tiny, excessive, elevated or invalid pull", () => {
    for (const point of [
      [0.25, 0.04, 0.16],
      [0.6, 0.04, 0.16],
      [0.36, 0.6, 0.16],
      [NaN, 0, 0],
    ] as const)
      expect(assistedTarget(passStart, point, [receiver, goal])).toBe(-1);
  });
  it("completes a pull-and-release pass then a shot from the new carrier", () => {
    const p = new TabletopPractice();
    p.start();
    p.pickBall();
    p.release([0.36, 0.04, 0.18]);
    finish(p);
    expect(p.success).toBe(true);
    expect(p.to).toEqual(receiver);
    p.primary();
    p.pickBall();
    p.release([-0.41, 0.04, 0.125]);
    finish(p);
    expect(p.success).toBe(true);
    expect(p.to).toEqual(goal);
  });
  it("cancels a tiny pull and permits an immediate retry", () => {
    const p = new TabletopPractice();
    p.start();
    p.pickBall();
    p.release([0.25, 0.04, 0.16]);
    expect(p.phase).toBe("ready");
    expect(p.pickBall()).toBe(true);
  });
  it("moves the ball with its carrier and targets the relocated teammate", () => {
    const p = new TabletopPractice();
    p.start();
    expect(p.movePlayer("source", [0.3, 0, 0])).toBe(true);
    expect(p.home).toEqual([0.3, 0.035, 0]);
    expect(p.from).toEqual(p.home);
    p.movePlayer("receiver", [-0.35, 0, 0]);
    p.pickBall();
    p.release([0.42, 0.04, 0]);
    finish(p);
    expect(p.success).toBe(true);
    expect(p.to).toEqual([-0.35, 0.035, 0]);
  });
  it("rejects off-pitch, overlapping, and mid-action figure moves", () => {
    const p = new TabletopPractice();
    p.start();
    expect(p.movePlayer("receiver", [1, 0, 0])).toBe(false);
    expect(p.movePlayer("receiver", passStart)).toBe(false);
    p.pickBall();
    expect(p.movePlayer("receiver", [-0.4, 0, 0])).toBe(false);
    expect(p.receiver).toEqual(receiver);
  });
  it("does not call a forward pass a successful backward pass", () => {
    const p = new TabletopPractice();
    p.start();
    p.movePlayer("receiver", [0.44, 0, -0.15]);
    p.pickBall();
    p.choose("teammate");
    finish(p);
    expect(p.success).toBe(false);
    expect(p.message).toContain("backwards");
  });
});
