import { expect, it } from "vitest";
import { MomentNotice } from "./notice";
it("coalesces arrivals, settles, expires and never replays a dismissed revision", () => {
  const n = new MomentNotice();
  expect(n.visible).toBe(false);
  n.update(1, 0);
  expect(n.visible).toBe(true);
  expect(n.scale(false)).toBeCloseTo(0);
  n.update(1, 0.7);
  expect(n.scale(false)).toBe(1);
  expect(n.rise(false)).toBeCloseTo(0);
  n.update(2, 0);
  expect(n.age).toBe(0);
  n.dismiss();
  n.update(2, 0.1);
  expect(n.visible).toBe(false);
  n.update(3, 0);
  n.update(3, 6);
  expect(n.visible).toBe(false);
});
it("honors reduced motion and ignores invalid elapsed time", () => {
  const n = new MomentNotice();
  n.update(1, 0);
  expect(n.scale(true)).toBe(1);
  expect(n.rise(true)).toBe(0);
  n.update(1, NaN);
  n.update(1, -1);
  expect(n.age).toBe(0);
});
