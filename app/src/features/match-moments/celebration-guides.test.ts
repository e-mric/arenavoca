import { expect, it } from "vitest";
import { CelebrationPose } from "./celebration-pose";
import { GoalCelebration } from "./celebration";
import scene from "../../../public/scenes/main.iwsdk.scene.json";
type Point = { x: number; y: number; z: number };
const space = {} as XRReferenceSpace;
function frame(
  head: Point,
  left: Point | null,
  right: Point | null,
  yaw = 0,
  hand = false,
) {
  const positions = { left, right };
  const get = (side: "left" | "right") =>
    positions[side] && { transform: { position: positions[side] } };
  return {
    session: {
      inputSources: ["left", "right"].map((side) => ({
        handedness: side,
        ...(hand ? { hand: new Map([["wrist", side]]) } : { gripSpace: side }),
      })),
    },
    getViewerPose: () => ({
      transform: {
        position: head,
        orientation: { x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) },
      },
    }),
    getPose: get,
    getJointPose: get,
  } as unknown as XRFrame;
}
it("shows each hand independently and requires placement, not arbitrary raised hands", () => {
  for (const hand of [false, true])
    for (const y of [1.1, 1.7]) {
      const pose = new CelebrationPose(),
        head = { x: 0, y, z: 0 },
        left = { x: -0.29, y: y - 0.02, z: -0.5 },
        right = { x: 0.29, y: y - 0.02, z: -0.5 };
      pose.read(frame(head, left, { ...right, y: y - 0.4 }, 0, hand), space, 1);
      expect(pose.leftInPlace).toBe(true);
      expect(pose.rightInPlace).toBe(false);
      expect(pose.raised).toBe(false);
      pose.read(
        frame(head, { ...left, z: 0.3 }, { ...right, z: 0.3 }, 0, hand),
        space,
        1,
      );
      expect(pose.raised).toBe(false);
      pose.read(frame(head, left, right, 0, hand), space, 1);
      expect(pose.raised).toBe(true);
      pose.read(frame(head, left, null, 0, hand), space, 1);
      expect(pose.leftInPlace).toBe(true);
      expect(pose.rightInPlace).toBe(false);
      expect(pose.tracked).toBe(false);
      pose.read(frame(head, { ...left, x: NaN }, right, 0, hand), space, 1);
      expect(pose.leftInPlace).toBe(false);
      expect(pose.raised).toBe(false);
    }
});
it("uses a generous volume while rejecting crossed hands and incorrect depth", () => {
  const p = new CelebrationPose(),
    h = { x: 0, y: 1.6, z: 0 },
    l = { x: -0.29, y: 1.58, z: -0.5 },
    r = { x: 0.29, y: 1.58, z: -0.5 };
  p.read(frame(h, { ...l, x: l.x - 0.14 }, r), space, 1);
  expect(p.raised).toBe(true);
  p.read(frame(h, { ...l, z: l.z - 0.16 }, r), space, 1);
  expect(p.raised).toBe(false);
  p.read(frame(h, r, l), space, 1);
  expect(p.raised).toBe(false);
});
it("anchors once at a rotated viewer and resets only for the next invitation", () => {
  const p = new CelebrationPose(),
    head = { x: 2, y: 1.2, z: 3 };
  const left = { x: 1.5, y: 1.18, z: 3.29 },
    right = { x: 1.5, y: 1.18, z: 2.71 };
  p.read(frame(head, left, right, Math.PI / 2), space, 1);
  expect(p.raised).toBe(true);
  p.read(frame({ x: 3, y: 1.4, z: 3 }, left, right, 0), space, 1);
  expect(p.raised).toBe(true);
  expect(p.x).toBe(2);
  expect(p.y).toBe(1.2);
  p.read(frame({ x: 3, y: 1.4, z: 3 }, left, right, 0), space, 2);
  expect(p.raised).toBe(false);
  expect(p.x).toBe(3);
  p.clear();
  expect(p.anchored).toBe(false);
  expect(p.tracked).toBe(false);
});
it("resets progress on leaving a guide and requires fresh placement after tracking loss", () => {
  const s = new GoalCelebration([]);
  s.setEnabled(true);
  s.tryDemo();
  s.observe(false, true, false, 0.1);
  s.observe(true, true, false, 0.1);
  s.observe(true, true, false, 0.1);
  expect(s.held).toBeCloseTo(0.2);
  s.observe(false, true, false, 0.1);
  expect(s.held).toBe(0);
  s.observe(true, true, false, 0.1);
  s.observe(true, false, false, 0.1);
  expect(s.held).toBe(0);
  for (let i = 0; i < 4; i++) s.observe(true, true, false, 0.1);
  expect(s.phase).toBe("invited");
  expect(s.needsFreshPose).toBe(true);
  s.observe(false, true, false, 0.1);
  for (let i = 0; i < 4; i++) s.observe(true, true, false, 0.1);
  expect(s.phase).toBe("celebrating");
});
it("keeps reachable guides separate from the movable screen", () => {
  const guides = scene.nodes[0].children!.find(
    (n) => n.id === "celebration-guides",
  )!;
  function position(id: string) {
    const node = guides.children!.find((n) => n.id === id);
    if (!node || !("transform" in node))
      throw new Error(`Missing transform: ${id}`);
    return node.transform!.position!;
  }
  expect(position("celebration-left-hand")).toEqual([-0.29, -0.02, -0.5]);
  expect(position("celebration-right-hand")).toEqual([0.29, -0.02, -0.5]);
  expect(position("goal-celebration")[1]).toBeLessThan(-0.2);
});
