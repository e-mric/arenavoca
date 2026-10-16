import { expect, it } from "vitest";
import { PalmReader } from "./palm";
function sample(
  side: "left" | "right",
  down = false,
  curled = false,
  missing = false,
) {
  const sign = (side === "left" ? 1 : -1) * (down ? -1 : 1);
  const positions: Record<string, number[]> = {
    wrist: [0, 1, -0.5],
    "index-finger-metacarpal": [0.035 * sign, 1, -0.54],
    "pinky-finger-metacarpal": [-0.035 * sign, 1, -0.54],
    "middle-finger-tip": [0, 1, curled ? -0.56 : -0.68],
  };
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
        : {
            transform: {
              position: {
                x: positions[k][0],
                y: positions[k][1],
                z: positions[k][2],
              },
            },
          },
  } as unknown as XRFrame;
}
it("recognizes either open upward palm, rejecting downward, curled and lost poses", () => {
  const r = new PalmReader();
  for (const side of ["left", "right"] as const) {
    r.read(sample(side), {} as XRReferenceSpace);
    expect(r.up).toBe(true);
    r.read(sample(side, true), {} as XRReferenceSpace);
    expect(r.up).toBe(false);
    r.read(sample(side, false, true), {} as XRReferenceSpace);
    expect(r.up).toBe(false);
    r.read(sample(side, false, false, true), {} as XRReferenceSpace);
    expect(r.tracked).toBe(false);
    expect(r.up).toBe(false);
  }
});
