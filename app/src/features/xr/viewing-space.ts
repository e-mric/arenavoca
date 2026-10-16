import type { ViewingMode } from "./theater";
/** Use one AR-capable session on Quest, with an opaque background for Quiet space. */
export function viewingSessionMode(passthroughSupported: boolean) {
  return passthroughSupported ? "immersive-ar" : "immersive-vr";
}
export class ViewingSpace {
  mode: ViewingMode = "theater";
  canShowRoom(blend: string | undefined) {
    return blend === "alpha-blend" || blend === "additive";
  }
  select(mode: ViewingMode, blend: string | undefined) {
    if (mode === "passthrough" && !this.canShowRoom(blend)) return false;
    this.mode = mode;
    return true;
  }
}
