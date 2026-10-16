import { expect, it, vi } from "vitest";
import { Group } from "@iwsdk/core";
import { HandleTouchPriority } from "./handle-input";
function fixture() {
  const policy = new HandleTouchPriority();
  const handle = new Group(),
    mark = new Group(),
    card = new Group();
  handle.add(mark);
  policy.targets.add(handle);
  let hit: { object: Group; distance: number } | undefined;
  const left = {
    getPointer: () => ({ getIntersection: () => hit }),
    toggleSubPointer: vi.fn(),
  };
  const right = {
    getPointer: () => ({ getIntersection: () => undefined }),
    toggleSubPointer: vi.fn(),
  };
  return {
    policy,
    mark,
    card,
    left,
    right,
    pointers: { left, right },
    hit: (value: typeof hit) => {
      hit = value;
    },
  };
}
it("gives a close handle grasp priority over button hover only for that hand", () => {
  const f = fixture();
  f.hit({ object: f.mark, distance: 0.01 });
  f.policy.update(f.pointers);
  expect(f.left.toggleSubPointer).toHaveBeenLastCalledWith("touch", false);
  expect(f.right.toggleSubPointer).not.toHaveBeenCalled();
  f.policy.update(f.pointers);
  expect(f.left.toggleSubPointer).toHaveBeenCalledTimes(1);
  f.hit({ object: f.card, distance: 0.01 });
  f.policy.update(f.pointers);
  expect(f.left.toggleSubPointer).toHaveBeenLastCalledWith("touch", true);
});
it("leaves distant handles alone and restores touch after release or tracking loss", () => {
  const f = fixture();
  f.hit({ object: f.mark, distance: 0.1 });
  f.policy.update(f.pointers);
  expect(f.left.toggleSubPointer).not.toHaveBeenCalled();
  f.hit({ object: f.mark, distance: 0 });
  f.policy.update(f.pointers);
  f.hit(undefined);
  f.policy.update(f.pointers);
  expect(f.left.toggleSubPointer).toHaveBeenLastCalledWith("touch", true);
  f.hit({ object: f.mark, distance: 0 });
  f.policy.update(f.pointers);
  f.policy.release(f.pointers);
  expect(f.left.toggleSubPointer).toHaveBeenLastCalledWith("touch", true);
});
