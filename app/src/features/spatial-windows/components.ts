import { createComponent, Types } from "@iwsdk/core";
/** Stable identities for dedicated manipulation targets, separate from UI buttons. */
export const SpatialWindow = createComponent("SpatialWindow", {
  window: { type: Types.String, default: "" },
  kind: { type: Types.Int8, default: 0 }, // near grab, distance move, corner resize
  held: { type: Types.Boolean, default: false },
  scale: { type: Types.Float32, default: 1 },
});
