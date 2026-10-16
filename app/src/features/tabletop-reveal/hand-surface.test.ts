import { describe, it, expect } from "vitest";
import { Vector3 } from "@iwsdk/core";
import { HandSurfaceReader } from "./hand-surface";
function fixture(tracked = true, halfWidth = 0.6) {
  const hand = (x: number) => ({
    handedness: x < 0 ? "left" : "right",
    hand: new Map(
      ["index-finger-tip", "middle-finger-tip", "wrist"].map((k) => [
        k,
        { x, y: k === "wrist" ? 0.78 : 0.76, z: -0.65 },
      ]),
    ),
  });
  const plane = {
    orientation: "horizontal",
    planeSpace: {},
    polygon: [
      { x: -halfWidth, z: -1 },
      { x: halfWidth, z: -1 },
      { x: halfWidth, z: 0 },
      { x: -halfWidth, z: 0 },
    ],
  };
  const frame = {
    session: { inputSources: [hand(-0.15), hand(0.15)] },
    detectedPlanes: new Set([plane]),
    getJointPose: (p: unknown) =>
      tracked ? { transform: { position: p } } : null,
    getPose: () => ({
      transform: {
        position: { x: 0, y: 0.75, z: 0 },
        matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0.75, 0, 1],
      },
    }),
  } as unknown as XRFrame;
  return frame;
}
describe("hand/surface observations", () => {
  it("accepts both hands on a sufficiently large horizontal plane", () => {
    const r = new HandSurfaceReader();
    expect(
      r.read(
        fixture(),
        {} as XRReferenceSpace,
        false,
        new Vector3(0, 1.6, 0),
        0.75,
      )?.source,
    ).toBe("surface");
  });
  it("does not fit the board onto a surface that only fits the hands", () => {
    const r = new HandSurfaceReader();
    expect(
      r.read(
        fixture(true, 0.2),
        {} as XRReferenceSpace,
        false,
        new Vector3(0, 1.6, 0),
        0.75,
      ),
    ).toBeNull();
  });
  it("requires explicit calibration before using unsupported hand height", () => {
    const r = new HandSurfaceReader(),
      f = fixture();
    Object.assign(f, { detectedPlanes: new Set() });
    expect(
      r.read(f, {} as XRReferenceSpace, false, new Vector3(0, 1.6, 0), 0.75),
    ).toBeNull();
    expect(
      r.read(f, {} as XRReferenceSpace, true, new Vector3(0, 1.6, 0), 0.75)
        ?.source,
    ).toBe("calibrated");
  });
  it("treats missing tracking as neither contact nor hands-away", () => {
    const r = new HandSurfaceReader();
    expect(
      r.read(
        fixture(false),
        {} as XRReferenceSpace,
        true,
        new Vector3(0, 1.6, 0),
        0.75,
      ),
    ).toBeNull();
    expect(r.handsAway).toBe(false);
  });
});
