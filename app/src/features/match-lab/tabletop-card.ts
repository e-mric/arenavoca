import {
  Group,
  Quaternion,
  UIKitMLAsset,
  Vector3,
  type World,
} from "@iwsdk/core";
import type { Experience } from "../session/experience";
import type { SpatialWindows } from "../spatial-windows/windows";
import { cardBackFacing } from "../spatial-windows/math";
/** Both faces belong to one grabbable object; wrist rotation reveals English. */
export function attachPracticeCard(
  world: World,
  e: Experience,
  fonts: unknown,
  windows: SpatialWindows,
  minimal = false,
) {
  const p = e.lab.tabletop;
  const card = world.requireSceneObject<Group>("window-tabletop-lesson");
  const faces = [
    world.requireSceneObject<UIKitMLAsset>("tabletop-lesson"),
    world.requireSceneObject<UIKitMLAsset>("tabletop-lesson-back"),
  ];
  const visibility = new Group();
  windows.bind("tabletop-lesson", visibility, 0.37, 0.475, true);
  const head = new Vector3(),
    center = new Vector3(),
    normal = new Vector3(),
    q = new Quaternion();
  const turn = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);
  let flipped = false,
    revision = -1;
  const caches = faces.map(() => new Map<string, string>());
  for (const panel of faces) {
    if (minimal)
      for (const id of ["table-atmosphere", "table-actions", "table-nav"])
        panel.requireElementById(id).setProperties({ display: "none" });
    panel.document.rootElement.setProperties({ fontFamilies: fonts as never });
    panel.document.setTargetDimensions(0.35, 0.462);
    const actions: Record<string, () => void> = {
      "table-hint": () => {
        p.translation = !p.translation;
      },
      "table-retry": () => p.primary(),
      "table-back": () => e.lab.browse(),
      "table-close": () => e.closeLab(),
      "table-atmosphere": () => p.atmosphere.toggle(),
    };
    for (const [id, fn] of Object.entries(actions)) {
      panel.requireElementById(id).addEventListener("click", fn);
      world.addCleanup(() =>
        panel.requireElementById(id).removeEventListener("click", fn),
      );
    }
  }
  return (visible: boolean) => {
    visibility.visible = card.visible = visible;
    if (!visible) return;
    if (world.renderer.xr.isPresenting) {
      if (revision !== p.revision) {
        p.translation = flipped;
        revision = p.revision;
      }
      if (p.translation !== flipped) {
        card.quaternion.multiply(turn);
        flipped = p.translation;
      }
      card.getWorldPosition(center);
      world.player.head.getWorldPosition(head);
      card.getWorldQuaternion(q);
      normal.set(0, 0, 1).applyQuaternion(q);
      flipped = cardBackFacing(
        normal.dot(head.sub(center).normalize()),
        flipped,
      );
      p.translation = flipped;
    }
    faces.forEach((panel, i) => {
      const copy: Record<string, string> = {
        "table-step": `${p.action === "pass" ? "01" : "02"} / ${i ? "ENGLISH" : "ESPAÑOL"}`,
        "table-phrase": i ? p.english : p.spanish,
        "table-translation": i
          ? "Turn back and try it in Spanish"
          : "Turn me over for English",
        "table-message": p.message,
        "table-primary": p.primaryLabel,
        "table-hint-label": "Flip",
        "table-atmosphere-label":
          p.atmosphere.mode === "team"
            ? "Switch to Minimal"
            : "Team atmosphere",
      };
      for (const [id, value] of Object.entries(copy))
        if (caches[i].get(id) !== value) {
          panel.requireElementById(id).setProperties({ text: value });
          caches[i].set(id, value);
        }
      const color =
        p.phase === "feedback"
          ? p.success
            ? "#ddd8ff"
            : "#ffc4b7"
          : "#ece8fc";
      if (caches[i].get("color") !== color) {
        panel
          .requireElementById("table-feedback")
          .setProperties({ backgroundColor: color });
        caches[i].set("color", color);
      }
    });
  };
}
