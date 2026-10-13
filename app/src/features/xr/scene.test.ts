import { it, expect } from "vitest";
import fs from "node:fs";
import config from "../../../iwsdk.config.json";
import scene from "../../../public/scenes/main.iwsdk.scene.json";
it("requires hands, disables locomotion and keeps the seated scene stationary", () => {
  expect(config.world.xr.features.handTracking).toEqual({ required: true });
  expect(config.world.features.locomotion).toBe(false);
  expect(config.world.features.grabbing).toBe(true);
  expect(config.world.xr.offer).toBe("once");
  expect(config.world.xr.features.gazeTracking).toBe(true);
});
it("keeps every panel clickable inside its own movable window", () => {
  const roots = scene.nodes[0].children;
  for (const id of [
    "welcome",
    "learning",
    "explore",
    "watch-controls",
    "karaoke",
    "coach",
    "match-lab",
  ]) {
    const anchor = roots.find((n) => n.id === `window-${id}`);
    expect(anchor, id).toBeDefined();
    const children = (
      anchor as { children?: { id: string; components?: unknown }[] }
    ).children;
    expect(children?.find((n) => n.id === id)?.components).toHaveProperty(
      "RayInteractable",
    );
  }
});
it("each floating window has separate near-grab, far-move and resize targets", () => {
  const roots = scene.nodes[0].children;
  for (const id of [
    "welcome",
    "learning",
    "explore",
    "watch-controls",
    "karaoke",
    "coach",
    "match-lab",
    "screen",
    "moment-card",
  ]) {
    for (const kind of [0, 1, 2]) {
      const target = roots.find(
        (n) =>
          n.id ===
          (kind === 0 && id === "moment-card"
            ? "window-moment-card"
            : `${id}-handle-${kind}`),
      );
      expect(target?.components).toHaveProperty(
        kind === 0 ? "TwoHandsGrabbable" : "DistanceGrabbable",
      );
      expect(target?.components).toHaveProperty("SpatialWindow", {
        window: id,
        kind,
      });
    }
  }
});
it("has real UIKitML controls for every essential action", () => {
  const markup = [
    "watch-controls",
    "learning",
    "explore",
    "welcome",
    "karaoke",
    "coach",
  ]
    .map((id) =>
      fs.readFileSync(
        new URL(`../../../public/ui/${id}.uikitml`, import.meta.url),
        "utf8",
      ),
    )
    .join("");
  for (const id of [
    "xr-reset-layout",
    "xr-coach-open",
    "xr-coach-close",
    "xr-coach-mic",
    "xr-coach-end",
    "xr-start",
    "xr-play",
    "xr-explore",
    "xr-trace-left",
    "xr-trace-right",
    "xr-replay",
    "xr-listen",
    "xr-save",
    "xr-back",
    "xr-resume",
    "xr-exit",
    "xr-panel-distance",
    "xr-panel-height",
    "xr-explore-play",
    "xr-team-blue",
    "xr-team-amber",
    "xr-team-neutral",
    "xr-karaoke-toggle",
    "xr-karaoke-hide",
  ])
    expect(markup).toContain(`id="${id}"`);
  expect(markup).toContain("../fonts/AtkinsonHyperlegible-Regular.ttf");
});
