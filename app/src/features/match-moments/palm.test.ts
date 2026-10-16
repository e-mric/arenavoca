import { expect, it } from "vitest";
import { Euler, Quaternion, Vector3 } from "@iwsdk/core";
import { PalmReader } from "./palm";
// WebXR joint -Y is palm-out; identity is palm-down, a half turn is palm-up.
function sample(
  side: "left" | "right",
  q: Quaternion,
  curled = false,
  missing = false,
) {
  const mirror = side === "left" ? 1 : -1;
  const wrist = new Vector3(0.2, 1, -0.5);
  const positions: Record<string, Vector3> = {
    wrist: new Vector3(),
    "index-finger-phalanx-proximal": new Vector3(0.035 * mirror, 0, -0.075),
    "pinky-finger-phalanx-proximal": new Vector3(-0.035 * mirror, 0, -0.07),
    "middle-finger-tip": new Vector3(0, 0, curled ? -0.06 : -0.18),
  };
  for (const p of Object.values(positions)) p.applyQuaternion(q).add(wrist);
  return {
    session: {
      inputSources: [
        {
          handedness: side,
          hand: new Map(Object.keys(positions).map((k) => [k, k])),
        },
      ],
    },
    getJointPose: (k: string) =>
      missing
        ? null
        : { transform: { position: positions[k], orientation: q } },
  } as unknown as XRFrame;
}
const up = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI);
it("uses the standard palm-out axis for either hand, rejecting the back, curls and tracking loss", () => {
  const r = new PalmReader();
  for (const side of ["left", "right"] as const) {
    r.read(sample(side, up), {} as XRReferenceSpace);
    expect(r.up).toBe(true);
    expect(r.normal.y).toBeCloseTo(1);
    r.read(sample(side, new Quaternion()), {} as XRReferenceSpace);
    expect(r.up).toBe(false);
    expect(r.normal.y).toBeCloseTo(-1);
    r.read(sample(side, up, true), {} as XRReferenceSpace);
    expect(r.up).toBe(false);
    r.read(sample(side, up, false, true), {} as XRReferenceSpace);
    expect(r.tracked).toBe(false);
    expect(r.up).toBe(false);
  }
});
it("places the menu over the palm centre and eight centimetres on its inside, including tilted hands", () => {
  const r = new PalmReader(),
    target = new Vector3();
  for (const side of ["left", "right"] as const) {
    for (const q of [
      up,
      new Quaternion().setFromEuler(new Euler(0.45, 0.6, Math.PI)),
    ]) {
      r.read(sample(side, q), {} as XRReferenceSpace);
      expect(r.up).toBe(true);
      const expectedCentre = new Vector3(0, 0, -0.145 / 3)
        .applyQuaternion(q)
        .add(new Vector3(0.2, 1, -0.5));
      expect(r.position.distanceTo(expectedCentre)).toBeLessThan(1e-8);
      expect(r.placeMenu(target)).toBe(target);
      const offset = target.clone().sub(r.position);
      expect(offset.length()).toBeCloseTo(0.08);
      expect(offset.dot(r.normal)).toBeCloseTo(0.08);
    }
  }
});
it("does not summon the menu from a missing or invalid wrist orientation", () => {
  const r = new PalmReader();
  r.read(sample("left", new Quaternion(0, 0, 0, 0)), {} as XRReferenceSpace);
  expect(r.tracked).toBe(false);
  expect(r.up).toBe(false);
});
