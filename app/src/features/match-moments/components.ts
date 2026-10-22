import { createComponent, Types } from "@iwsdk/core";
/** Observable prototype state for emulator and device acceptance. */
export const CelebrationStatus = createComponent("CelebrationStatus", {
  enabled: { type: Types.Boolean, default: false },
  phase: { type: Types.String, default: "idle" },
  goalId: { type: Types.String, default: "" },
  tracked: { type: Types.Boolean, default: false },
  raised: { type: Types.Boolean, default: false },
  leftInPlace: { type: Types.Boolean, default: false },
  rightInPlace: { type: Types.Boolean, default: false },
  holdProgress: { type: Types.Float32, default: 0 },
  recordingSeconds: { type: Types.Float32, default: 0 },
  playing: { type: Types.Boolean, default: false },
});
