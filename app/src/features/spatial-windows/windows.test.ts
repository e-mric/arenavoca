import { describe, it, expect, vi } from "vitest";
import {
  Grabbed,
  GrabSystem,
  Group,
  Quaternion,
  Vector3,
  type Entity,
  type World,
} from "@iwsdk/core";
import { SpatialWindows, WindowTargets } from "./windows";
import { cardBackFacing, resizedScale, windowScale } from "./math";
function fixture(direct = false) {
  const anchor = new Group();
  anchor.position.set(2, 1, -3);
  if (direct) anchor.scale.setScalar(0.7);
  const content = direct ? new Group() : anchor;
  content.visible = true;
  const targets = [0, 1, 2, 3, 4].map((kind) => ({
    object3D: direct && kind === 0 ? anchor : new Group(),
    held: false,
    values: { window: "test", kind, held: false, scale: 1 } as Record<
      string,
      unknown
    >,
    hasComponent(c: unknown) {
      return c === Grabbed && this.held;
    },
    getValue(_c: unknown, key: string) {
      return this.values[key];
    },
    setValue(_c: unknown, key: string, value: unknown) {
      this.values[key] = value;
    },
  }));
  const grab = {
    config: { useHandPinchForGrab: { value: false } },
    forceRelease: vi.fn((e: (typeof targets)[0]) => {
      e.held = false;
    }),
  };
  const pointer = {
    getPointer: () => ({ getIntersection: () => undefined }),
    toggleSubPointer: vi.fn(),
  };
  const world = {
    input: { xr: { multiPointers: { left: pointer, right: pointer } } },
    registerSystem: vi.fn(),
    getSystem: (s: unknown) =>
      s === GrabSystem
        ? grab
        : s === WindowTargets
          ? { queries: { handles: { entities: new Set(targets) } } }
          : null,
    requireSceneObject: () => anchor,
    addCleanup: vi.fn(),
    visibilityState: { subscribe: vi.fn(() => () => {}) },
  };
  const windows = new SpatialWindows(world as unknown as World);
  windows.bind("test", content, 1, 1, direct);
  return { windows, anchor, content, targets, grab };
}
describe("spatial window manipulation", () => {
  it("moves from its dedicated handle, keeps the released transform, and resets without changing content", () => {
    const { windows, anchor, targets, grab } = fixture();
    const near = targets[0];
    expect(grab.config.useHandPinchForGrab.value).toBe(true);
    near.held = true;
    near.object3D.position.x += 0.4;
    windows.update();
    expect(anchor.position.x).toBeCloseTo(2.4);
    expect(near.values.held).toBe(true);
    near.held = false;
    windows.update();
    expect(anchor.position.x).toBeCloseTo(2.4);
    windows.reset();
    expect(anchor.position.toArray()).toEqual([2, 1, -3]);
  });
  it("two-hand scale and rotation carry the entire content anchor, without stretching", () => {
    const { windows, anchor, targets } = fixture();
    const near = targets[0];
    near.held = true;
    near.object3D.scale.setScalar(1.5);
    near.object3D.rotation.y = Math.PI / 2;
    windows.update();
    expect(anchor.scale.toArray()).toEqual([1.5, 1.5, 1.5]);
    expect(anchor.quaternion.angleTo(near.object3D.quaternion)).toBeCloseTo(0);
    expect(targets[1].object3D.scale.x).toBe(1.5);
  });
  it("a corner drag resizes about the window centre with bounded uniform dimensions", () => {
    const { windows, anchor, targets } = fixture();
    const corner = targets[2];
    corner.held = true;
    windows.update();
    const center = anchor.position.clone();
    const delta = corner.object3D.position.clone().sub(center);
    corner.object3D.position.copy(center).add(delta.multiplyScalar(1.6));
    windows.update();
    expect(anchor.scale.x).toBeCloseTo(1.6);
    expect(anchor.position.equals(center)).toBe(true);
    corner.object3D.position.copy(center).add(delta.multiplyScalar(100));
    windows.update();
    expect(anchor.scale.x).toBe(2.2);
  });
  it("hidden windows release manipulation and cannot continue moving", () => {
    const { windows, targets, content, grab } = fixture();
    targets[1].held = true;
    windows.update();
    content.visible = false;
    windows.update();
    expect(grab.forceRelease).toHaveBeenCalled();
    expect(targets[1].object3D.visible).toBe(false);
  });
  it("direct card grasp preserves its wrist rotation and release position", () => {
    const { windows, anchor, targets } = fixture(true);
    targets[0].held = true;
    anchor.position.set(0.2, 1.3, -0.6);
    anchor.rotation.y = Math.PI;
    windows.update();
    targets[0].held = false;
    windows.update();
    expect(anchor.position.toArray()).toEqual([0.2, 1.3, -0.6]);
    expect(
      anchor.quaternion.angleTo(
        new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI),
      ),
    ).toBeCloseTo(0);
  });
  it("opposing hands cannot drive different handles of the same window", () => {
    const { windows, targets, grab } = fixture();
    targets[0].held = true;
    windows.update();
    targets[2].held = true;
    windows.update();
    expect(grab.forceRelease).toHaveBeenCalledWith(targets[2]);
    expect(targets[0].values.held).toBe(true);
  });
});
it("scale limits reject invalid distances and keep a usable minimum", () => {
  expect(windowScale(NaN)).toBe(1);
  expect(windowScale(-2)).toBe(0.45);
  expect(resizedScale(1, 0, 2)).toBe(1);
  expect(resizedScale(1, 1, NaN)).toBe(1);
});
it("turning a card exposes its actual reverse face without edge-on flicker", () => {
  expect(cardBackFacing(-1, false)).toBe(true);
  expect(cardBackFacing(0.05, true)).toBe(true);
  expect(cardBackFacing(1, true)).toBe(false);
  expect(cardBackFacing(-0.05, false)).toBe(false);
});

it("reset restores the authored handheld-card size rather than enlarging it", () => {
  const { windows, anchor } = fixture(true);
  anchor.scale.setScalar(1.8);
  windows.reset();
  expect(anchor.scale.toArray()).toEqual([0.7, 0.7, 0.7]);
});

it("the visible card bar moves both faces without needing a direct card grasp", () => {
  const { windows, anchor, targets } = fixture(true);
  const bar = targets[3];
  bar.held = true;
  bar.object3D.position.add(new Vector3(0.2, 0.1, 0.3));
  windows.update();
  expect(anchor.position.toArray()).toEqual([2.2, 1.1, -2.7]);
  bar.held = false;
  windows.update();
  expect(anchor.scale.x).toBeCloseTo(0.7);
  expect(targets[1].object3D.visible).toBe(true);
});
it("the near corner supports pinch resizing and releases with the card", () => {
  const { windows, anchor, targets, content, grab } = fixture(true);
  const corner = targets[4];
  corner.held = true;
  windows.update();
  corner.object3D.position
    .sub(anchor.position)
    .multiplyScalar(1.5)
    .add(anchor.position);
  windows.update();
  expect(anchor.scale.x).toBeCloseTo(1.05);
  content.visible = false;
  windows.update();
  expect(grab.forceRelease).toHaveBeenCalledWith(corner);
  for (const target of targets) expect(target.object3D.visible).toBe(false);
});

it("distance chrome cannot intercept near touch before a pinch grab", () => {
  const { targets } = fixture();
  expect(targets[1].object3D.pointerEventsType).toEqual({ allow: "ray" });
  expect(targets[2].object3D.pointerEventsType).toEqual({ allow: "ray" });
  for (const kind of [0, 3, 4])
    expect(targets[kind].object3D.pointerEventsType).toEqual({ allow: "grab" });
});

it("keeps the card bar tucked beneath its edge as the card shrinks and grows", () => {
  const { windows, anchor, targets } = fixture(true);
  for (const scale of [0.45, 0.85, 2.2]) {
    anchor.scale.setScalar(scale);
    windows.update();
    const bottom = anchor.position.y - 0.5 * scale;
    expect(bottom - targets[3].object3D.position.y).toBeCloseTo(0.05 * scale);
  }
});
