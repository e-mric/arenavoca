import type { Object3D } from "@iwsdk/core";
const hands = ["left", "right"] as const;
type Pointer = {
  getPointer(kind: "grab"): {
    getIntersection(): { object: Object3D; distance: number } | undefined;
  };
  toggleSubPointer(kind: "touch", enabled: boolean): void;
};
/** A deliberate close grasp on window chrome takes priority over nearby UI hover. */
export class HandleTouchPriority {
  readonly targets = new Set<Object3D>();
  private suppressed = { left: false, right: false };
  update(pointers: Record<(typeof hands)[number], Pointer>) {
    for (const hand of hands) {
      const pointer = pointers[hand];
      const hit = pointer.getPointer("grab").getIntersection();
      let object = hit && hit.distance <= 0.03 ? hit.object : null;
      while (object && !this.targets.has(object)) object = object.parent;
      const suppress = object !== null;
      if (suppress === this.suppressed[hand]) continue;
      pointer.toggleSubPointer("touch", !suppress);
      this.suppressed[hand] = suppress;
    }
  }
  release(pointers: Record<(typeof hands)[number], Pointer>) {
    for (const hand of hands) {
      if (this.suppressed[hand]) pointers[hand].toggleSubPointer("touch", true);
      this.suppressed[hand] = false;
    }
  }
}
