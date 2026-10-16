import { Group, UIKitMLAsset, type World } from "@iwsdk/core";
import type { Experience } from "../session/experience";

/** All commands target the pinned card; none can seek or pause the match. */
export function momentActions(e: Experience) {
  return {
    replay: () => {
      if (e.lab.open && !e.lab.cards.card.context) e.replayLab();
    },
    listen: () => {
      if (e.lab.open && e.lab.cards.audioId) void e.listenLab();
    },
    save: () => {
      if (e.lab.open) e.saveLab();
    },
  };
}
export function attachMomentActions(
  world: World,
  e: Experience,
  fonts: unknown,
) {
  const actions = momentActions(e);
  const card = world.requireSceneObject<Group>("window-moment-card");
  const panels = ["moment-actions", "moment-actions-back"].map((id) =>
    world.requireSceneObject<UIKitMLAsset>(id),
  );
  const caches = panels.map(() => new Map<string, unknown>());
  const probes: { panel: UIKitMLAsset; id: string; marker: Group }[] = [];
  panels.forEach((panel, side) => {
    panel.document.setTargetDimensions(0.44, 0.13);
    panel.document.rootElement.setProperties({ fontFamilies: fonts as never });
    for (const [name, action] of Object.entries(actions)) {
      const id = `card-${name}`;
      const node = panel.requireElementById(id);
      node.name = `${side ? "back" : "front"}/${id}`;
      node.addEventListener("click", action);
      world.addCleanup(() => node.removeEventListener("click", action));
      if (import.meta.env.DEV) {
        const marker = new Group();
        marker.name = `card-target/${side}/${id}`;
        world.createTransformEntity(marker);
        probes.push({ panel, id, marker });
      }
    }
  });
  const renderers = panels.map((panel, side) => {
    const cache = caches[side];
    const set = (id: string, property: string, value: string | boolean) => {
      const key = `${id}/${property}`;
      if (cache.get(key) === value) return;
      panel.requireElementById(id).setProperties({ [property]: value });
      cache.set(key, value);
    };
    return () => {
      panel.visible = card.visible && e.lab.cards.flipped === !!side;
      const replay = !e.lab.cards.card.context;
      const listen = !!e.lab.cards.audioId;
      set("card-replay", "disabled", !replay);
      set("card-replay", "backgroundColor", replay ? "#ddd8ff" : "#e8e4de");
      set("card-listen", "disabled", !listen);
      set("card-listen", "backgroundColor", listen ? "#1646ed" : "#687084");
      set("card-save", "backgroundColor", e.lab.saved ? "#c5dec9" : "#ddd8ff");
      set("card-listen-label", "text", e.audio.speaking ? "Playing" : "Listen");
      set("card-save-label", "text", e.lab.saved ? "Saved" : "Save");
      set("card-bookmark", "display", e.lab.saved ? "none" : "flex");
      set("card-bookmark-saved", "display", e.lab.saved ? "flex" : "none");
      set(
        "card-status",
        "text",
        e.labReplay?.error
          ? "Replay unavailable - try again"
          : e.labReplay?.visible && !e.labReplay.video.paused
            ? "Replay playing - match continues"
            : e.lab.notice
              ? e.lab.saved
                ? "Saved on this device"
                : e.lab.notice
              : !listen
                ? "Audio not prepared for this card"
                : side
                  ? "Flip back for Spanish"
                  : "Flip for English",
      );
    };
  });
  return () => {
    for (const render of renderers) render();
    for (const { panel, id, marker } of probes)
      panel.requireElementById(id).getWorldPosition(marker.position);
  };
}
