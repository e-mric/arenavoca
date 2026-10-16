import { describe, it, expect } from "vitest";
import {
  TabletopReveal,
  restingHands,
  pointInside,
  type RestCandidate,
} from "./reveal";
const pose: RestCandidate = {
  x: 0,
  y: 0.75,
  z: -0.65,
  yaw: 0,
  source: "surface",
  key: "table",
};
function hold(r: TabletopReveal, c: RestCandidate | null = pose, n = 11) {
  let placed = false;
  for (let i = 0; i < n; i++) placed = r.observe(c, false, 0.1) || placed;
  return placed;
}
describe("hands reveal a stable tabletop", () => {
  it("requires a deliberate stable hold and places only once", () => {
    const r = new TabletopReveal();
    expect(hold(r, pose, 4)).toBe(false);
    expect(r.progress).toBeGreaterThan(0);
    expect(hold(r)).toBe(true);
    const p = r.placement;
    expect(hold(r, { ...pose, x: 2 })).toBe(false);
    expect(r.placement).toBe(p);
    hold(r, null);
    expect(r.placement).toBe(p);
  });
  it("resets progress on missing poses, movement or a different surface", () => {
    const r = new TabletopReveal();
    hold(r, pose, 4);
    r.observe(null, false, 0.1);
    expect(r.progress).toBe(0);
    hold(r, pose, 4);
    r.observe({ ...pose, x: 0.04 }, false, 0.1);
    expect(r.progress).toBe(0);
    hold(r, pose, 4);
    r.observe({ ...pose, key: "other" }, false, 0.1);
    expect(r.progress).toBe(0);
  });
  it("close requires tracked hands to leave before it can reopen", () => {
    const r = new TabletopReveal();
    hold(r);
    r.close();
    expect(hold(r)).toBe(false);
    hold(r, null, 20);
    expect(r.waitingForHandsAway).toBe(true);
    for (let i = 0; i < 4; i++) r.observe(null, true, 0.1);
    expect(hold(r)).toBe(true);
  });
  it("explicit calibration rearms after closing but still requires a stable hold", () => {
    const r = new TabletopReveal();
    hold(r);
    r.close();
    r.calibrate();
    expect(r.waitingForHandsAway).toBe(false);
    expect(r.placement).toBeNull();
    expect(hold(r, { ...pose, source: "calibrated" }, 4)).toBe(false);
    expect(hold(r, { ...pose, source: "calibrated" })).toBe(true);
  });
  it("turning the head too far resets the pending orientation", () => {
    const r = new TabletopReveal();
    hold(r, pose, 4);
    r.observe({ ...pose, yaw: 0.3 }, false, 0.1);
    expect(r.progress).toBe(0);
  });
  it("manual placement is explicit and tracking cannot overwrite it", () => {
    const r = new TabletopReveal();
    r.manual({ ...pose, source: "manual" });
    hold(r, { ...pose, y: 2 });
    expect(r.placement?.y).toBe(0.75);
    expect(r.placement?.source).toBe("manual");
  });
  it("invalid and large deltas cannot complete a hold unexpectedly", () => {
    const r = new TabletopReveal();
    r.observe(pose, false, NaN);
    expect(r.progress).toBe(0);
    r.observe(pose, false, 0.1);
    r.observe(pose, false, 99);
    expect(r.progress).toBeLessThan(0.2);
  });
  it("requires separated hands at a similar height", () => {
    expect(
      restingHands({ x: -0.15, y: 0.75, z: 0 }, { x: 0.15, y: 0.76, z: 0 }),
    ).toBe(true);
    expect(
      restingHands({ x: 0, y: 0.75, z: 0 }, { x: 0.05, y: 0.75, z: 0 }),
    ).toBe(false);
    expect(restingHands({ x: 0, y: 0.75, z: 0 }, { x: 0.3, y: 1, z: 0 })).toBe(
      false,
    );
  });
  it("rejects points outside the actual surface polygon", () => {
    const p = [
      { x: -1, z: -1 },
      { x: 1, z: -1 },
      { x: 1, z: 1 },
      { x: -1, z: 1 },
    ];
    expect(pointInside(0, 0, p)).toBe(true);
    expect(pointInside(1.1, 0, p)).toBe(false);
  });
});

it("preserves placement through intermediate closed notifications while opening the lab", () => {
  const r = new TabletopReveal();
  r.manual({ ...pose, source: "manual" });
  r.syncLab(false); // stopAudio emits before lab.show()
  expect(r.placement).not.toBeNull();
  r.syncLab(true);
  expect(r.placement).not.toBeNull();
  r.syncLab(false); // explicit close after the lab was open
  expect(r.placement).toBeNull();
  expect(r.waitingForHandsAway).toBe(true);
});
