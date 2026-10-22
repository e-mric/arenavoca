import { expect, it } from "vitest";
import { GoalCelebration } from "./celebration";
import { CelebrationPose } from "./celebration-pose";

function ready() {
  const state = new GoalCelebration([{ id: "reviewed-goal", endSeconds: 820 }]);
  state.setEnabled(true);
  state.observe(false, true, false, 0.1);
  state.update(819.9, true, false, true, 0.1);
  state.update(820, true, false, true, 0.1);
  return state;
}
function lift(state: GoalCelebration) {
  for (let i = 0; i < 4; i++) state.observe(true, true, false, 0.1);
}
it("is opt-in, opens only after a naturally crossed prepared goal, and never repeats on replay", () => {
  const off = new GoalCelebration([{ id: "goal", endSeconds: 820 }]);
  off.update(819.9, true, false, true, 0.1);
  off.update(820, true, false, true, 0.1);
  expect(off.phase).toBe("idle");
  const state = ready();
  expect(state.phase).toBe("invited");
  lift(state);
  expect(state.phase).toBe("celebrating");
  state.update(810, true, true, true, 0.1);
  state.update(819.9, true, false, true, 0.1);
  state.update(820, true, false, true, 0.1);
  expect(state.phase).toBe("idle");
});
it("does not spoil a goal, announce seek/resume history, or use an unrelated recording", () => {
  for (const [time, playing, seeking, eligible] of [
    [819.99, true, false, true],
    [820, true, true, true],
    [820, false, false, true],
    [820, true, false, false],
    [900, true, false, true],
  ] as const) {
    const state = new GoalCelebration([{ id: "goal", endSeconds: 820 }]);
    state.setEnabled(true);
    state.update(819, true, false, true, 0.1);
    state.update(time, playing, seeking, eligible, 0.1);
    expect(state.phase).toBe("idle");
  }
  const late = new GoalCelebration([{ id: "goal", endSeconds: 820 }]);
  late.setEnabled(true);
  late.update(820.1, true, false, true, 0.1);
  expect(late.phase).toBe("idle");
});
it("requires a fresh bilateral held raise and resets the hold after tracking loss or manipulation", () => {
  const state = ready();
  state.observe(true, true, false, 0.1);
  state.observe(true, true, false, 0.1);
  expect(state.phase).toBe("invited");
  state.observe(false, false, false, 0.1);
  lift(state);
  expect(state.phase).toBe("invited");
  state.observe(false, true, false, 0.1);
  state.observe(true, true, true, 0.1);
  lift(state);
  expect(state.phase).toBe("invited");
  state.observe(false, true, false, 0.1);
  lift(state);
  expect(state.phase).toBe("celebrating");
});
it("does not count a pose that was already raised when the goal arrived", () => {
  const state = new GoalCelebration([{ id: "goal", endSeconds: 820 }]);
  state.setEnabled(true);
  state.observe(true, true, false, 0.1);
  state.update(819.9, true, false, true, 0.1);
  state.update(820, true, false, true, 0.1);
  lift(state);
  expect(state.phase).toBe("invited");
  state.observe(false, true, false, 0.1);
  lift(state);
  expect(state.phase).toBe("celebrating");
});
it("expires quietly, cancels on pause/seek/opt-out, and ends the animation without penalties", () => {
  for (const action of ["pause", "seek", "opt-out", "timeout"] as const) {
    const state = ready();
    if (action === "opt-out") state.setEnabled(false);
    else if (action === "timeout")
      for (let i = 0; i < 102; i++) state.update(820, true, false, true, 0.1);
    else state.update(820.1, action !== "pause", action === "seek", true, 0.1);
    expect(state.phase).toBe("idle");
  }
  const state = ready();
  lift(state);
  for (let i = 0; i < 42; i++) state.update(820, true, false, true, 0.1);
  expect(state.phase).toBe("idle");
});
it("labels an explicit demo separately and leaves it usable while the match is paused", () => {
  const state = new GoalCelebration([]);
  state.tryDemo();
  expect(state.phase).toBe("idle");
  state.setEnabled(true);
  state.tryDemo();
  state.update(0, false, false, false, 0.1);
  expect(state.demo).toBe(true);
  expect(state.goalId).toBe("demo");
  state.observe(false, true, false, 0.1);
  lift(state);
  expect(state.phase).toBe("celebrating");
});
function frame(
  height: number,
  hand: boolean,
  leftY: number,
  rightY: number,
  missing = false,
) {
  return {
    session: {
      inputSources: ["left", "right"].map((side, i) => ({
        handedness: side,
        ...(hand ? { hand: new Map([["wrist", side]]) } : { gripSpace: side }),
      })),
    },
    getViewerPose: () => ({
      transform: { position: { x: 0, y: height, z: 0 } },
    }),
    getJointPose: (side: string) =>
      missing && side === "right"
        ? null
        : {
            transform: {
              position: {
                x: side === "right" ? 0.25 : -0.25,
                y: side === "right" ? rightY : leftY,
                z: -0.3,
              },
            },
          },
    getPose: (side: string) =>
      missing && side === "right"
        ? null
        : {
            transform: {
              position: {
                x: side === "right" ? 0.25 : -0.25,
                y: side === "right" ? rightY : leftY,
                z: -0.3,
              },
            },
          },
  } as unknown as XRFrame;
}
it("reads real wrist or grip poses relative to seated/standing head height, rejecting single hands and loss", () => {
  const reader = new CelebrationPose();
  for (const hand of [true, false])
    for (const height of [1.1, 1.7]) {
      reader.read(
        frame(height, hand, height + 0.05, height + 0.05),
        {} as XRReferenceSpace,
      );
      expect(reader.tracked).toBe(true);
      expect(reader.raised).toBe(true);
      reader.read(
        frame(height, hand, height, height - 0.3),
        {} as XRReferenceSpace,
      );
      expect(reader.raised).toBe(false);
      reader.read(
        frame(height, hand, height, height, true),
        {} as XRReferenceSpace,
      );
      expect(reader.tracked).toBe(false);
      expect(reader.raised).toBe(false);
      reader.read(frame(height, hand, NaN, height), {} as XRReferenceSpace);
      expect(reader.tracked).toBe(false);
    }
});
