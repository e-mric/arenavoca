import { it, expect } from "vitest";
import fs from "node:fs";
import config from "../../../iwsdk.config.json";
import scene from "../../../public/scenes/main.iwsdk.scene.json";
it("allows controller fallback, disables locomotion and keeps the seated scene stationary", () => {
  expect(config.world.xr.features.handTracking).toEqual({ required: false });
  expect(config.world.xr.features).not.toHaveProperty("planeDetection");
  expect(config.world.features.locomotion).toBe(false);
  expect(config.world.features.grabbing).toBe(true);
  expect(config.world.xr.offer).toBe("once");
  expect(config.world.xr.features.gazeTracking).toBe(true);
});
type SceneNode = {
  id: string;
  transform?: {
    position?: number[];
    rotationDeg?: number[];
    scale?: number | number[];
  };
  components?: Record<string, unknown>;
  content?: { asset?: string };
  children?: SceneNode[];
};
const roots: SceneNode[] = scene.nodes[0].children ?? [];
function flatten(nodes: SceneNode[]): SceneNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);
}
it("removes retired panels and scenery from the editor scene and asset catalogue", () => {
  const nodes = flatten(roots);
  const manifest = fs.readFileSync(
    new URL("../../assets.ts", import.meta.url),
    "utf8",
  );
  for (const id of [
    "welcome",
    "learning",
    "explore",
    "watch-controls",
    "karaoke",
    "coach",
    "match-lab",
    "team-stadium",
    "screen",
  ]) {
    expect(
      nodes.some(
        (node) =>
          node.id === id ||
          node.id === `window-${id}` ||
          node.id.startsWith(`${id}-handle-`),
      ),
      id,
    ).toBe(false);
    expect(manifest).not.toContain(`"${id}"`);
  }
  for (const asset of [
    "teamStadium",
    "teamCelebration",
    "theater",
    "arena",
    "matchScreen",
    "matchFrame",
    "labBoard",
    "labPawn",
    "passDiagram",
    "traceDiagram",
    "tabletopPitch",
    "minimalPitch",
    "quietTable",
    "placementOutline",
    "tabletopPlayer",
    "practiceCard",
  ]) {
    expect(
      nodes.some((node) => node.content?.asset === asset),
      asset,
    ).toBe(false);
    expect(manifest).not.toMatch(new RegExp(`\\b${asset}\\b`));
  }
});
it("keeps the minimal dock clickable and keeps the scene free of tabletop assets", () => {
  const nodes = flatten(roots);
  expect(nodes.find((n) => n.id === "minimal-dock")?.components).toHaveProperty(
    "RayInteractable",
  );
  expect(nodes.find((n) => n.id === "minimal-screen")?.content?.asset).toBe(
    "minimalScreen",
  );
  expect(
    nodes.some((n) =>
      /tabletop|quiet-table|table-placement-outline/.test(n.id),
    ),
  ).toBe(false);
});
it("each retained floating window has separate near-grab, far-move and resize targets", () => {
  for (const id of ["moment-card", "minimal-screen", "minimal-dock"]) {
    for (const kind of [0, 1, 2]) {
      const direct = ["moment-card", "tabletop-lesson"].includes(id);
      const target = roots.find(
        (n) =>
          n.id ===
          (kind === 0 && direct ? `window-${id}` : `${id}-handle-${kind}`),
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
it("keeps global controls in the menu and moment actions on both card faces", () => {
  const markup = fs.readFileSync(
    new URL("../../../public/ui/minimal-dock.uikitml", import.meta.url),
    "utf8",
  );
  for (const id of [
    "minimal-play",
    "minimal-open",
    "minimal-close",
    "minimal-pregame",
    "minimal-jump",
    "minimal-previous",
    "minimal-recenter",
    "minimal-flip",
    "minimal-more",
    "minimal-hide",
    "minimal-story",
    "minimal-next",
  ])
    expect(markup).toContain(`id="${id}"`);
  expect(markup).toContain("../fonts/AtkinsonHyperlegible-Regular.ttf");
  for (const action of ["replay", "listen", "save"])
    expect(markup).not.toContain(`id="minimal-${action}"`);
  const actions = fs.readFileSync(
    new URL("../../../public/ui/moment-actions.uikitml", import.meta.url),
    "utf8",
  );
  for (const action of ["replay", "listen", "save"])
    expect(actions).toContain(`id="card-${action}"`);
  const card = roots.find((n) => n.id === "window-moment-card")!;
  expect(card.children).toHaveLength(2);
  for (const child of card.children!)
    expect(child.components).toHaveProperty("RayInteractable");
});

it("keeps dock content centered in its movable anchor", () => {
  const dock = roots.find((n) => n.id === "window-minimal-dock")!;
  expect(
    dock.children?.find((n) => n.id === "minimal-dock"),
  ).not.toHaveProperty("transform");
});
