import { it, expect } from "vitest";
import fs from "node:fs";
import config from "../../../iwsdk.config.json";
import scene from "../../../public/scenes/main.iwsdk.scene.json";
it("requires hands, disables locomotion and keeps the seated scene stationary", () => {
  expect(config.world.xr.features.handTracking).toEqual({ required: true });
  expect(config.world.features.locomotion).toBe(false);
  expect(config.world.features.grabbing).toBe(false);
  expect(config.world.xr.offer).toBe("once");
  expect(config.world.xr.features.gazeTracking).toBe(true);
});
it("registers every spatial control as a hand-ray target", () => {
  for (const node of scene.nodes[0].children.filter(
    (n) =>
      "content" in n &&
      ["welcome", "learning", "explore", "watch-controls", "karaoke"].includes(
        n.id,
      ),
  )) {
    expect(node.components).toHaveProperty("RayInteractable");
    expect(node.transform?.position?.[2]).toBeLessThan(0);
  }
});
it("has real UIKitML controls for every essential action", () => {
  const markup = ["watch-controls", "learning", "explore", "welcome", "karaoke"]
    .map((id) =>
      fs.readFileSync(
        new URL(`../../../public/ui/${id}.uikitml`, import.meta.url),
        "utf8",
      ),
    )
    .join("");
  for (const id of [
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
