/** Immersive viewing identity, independent of the browser-window source route. */
export const theaterName = "ArenaVoca viewing lounge";

export type ViewingMode = "theater" | "passthrough";
/** AR keeps the camera view clear; geometry and panels remain world anchored. */
export function viewingPolicy(mode: ViewingMode) {
  return {
    roomVisible: mode === "theater",
    transparent: mode === "passthrough",
    sessionMode: mode === "passthrough" ? "immersive-ar" : "immersive-vr",
  } as const;
}

export function applyViewingMode<T>(
  mode: ViewingMode,
  scene: { background: T | null },
  room: { visible: boolean },
  renderer: { setClearAlpha: (value: number) => void },
  theaterBackground: T,
) {
  const policy = viewingPolicy(mode);
  room.visible = policy.roomVisible;
  scene.background = policy.transparent ? null : theaterBackground;
  renderer.setClearAlpha(policy.transparent ? 0 : 1);
}
