import type { Snapshot } from "../progress/store";
/** Deliberate world-space presets. No head following or automatic movement. */
export function companionPlacement(preferences: Snapshot["preferences"]) {
  const side = preferences.panelSide === "left" ? -1 : 1;
  const near = preferences.panelDistance === "near";
  return {
    x: (near ? 0.55 : 1.4) * side,
    y: preferences.panelHeight === "high" ? 1.3 : 1.04,
    z: near ? -0.55 : -2.05,
    width: near ? 0.7 : 0.98,
  };
}
