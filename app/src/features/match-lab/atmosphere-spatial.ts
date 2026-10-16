import {
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  SRGBColorSpace,
  type World,
} from "@iwsdk/core";
import type { Experience } from "../session/experience";
import type { SpatialWindows } from "../spatial-windows/windows";
import { footballKits, teamThemes } from "../theme/team-theme";
/** An independently movable diorama, not a scanned wall or a second video player. */
export function attachTeamAtmosphere(
  world: World,
  e: Experience,
  windows: SpatialWindows,
) {
  const stadium = world.requireSceneObject<Group>("window-team-stadium");
  const burst = world.requireSceneObject<Group>("tabletop-celebration");
  const visibility = new Group();
  visibility.visible = false;
  windows.bind("team-stadium", visibility, 1.38, 1.18, true);
  const primary: MeshBasicMaterial[] = [],
    secondary: MeshBasicMaterial[] = [];
  for (const root of [stadium, burst])
    root.traverse((node) => {
      if (!(node instanceof Mesh) || !node.name.startsWith("team-")) return;
      const material = (node.material as MeshBasicMaterial).clone();
      node.material = material;
      (node.name.startsWith("team-primary") ? primary : secondary).push(
        material,
      );
      world.addCleanup(() => material.dispose());
    });
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 136;
  const ctx = canvas.getContext("2d")!;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const label = stadium.getObjectByName("Team banner label") as Mesh;
  const material = new MeshBasicMaterial({ map: texture });
  label.material = material;
  world.addCleanup(() => {
    texture.dispose();
    material.dispose();
  });
  let knownTeam = "";
  return (visible: boolean) => {
    const p = e.lab.tabletop,
      atmosphere = p.atmosphere;
    visibility.visible = stadium.visible =
      visible && atmosphere.mode === "team";
    burst.visible = visible && atmosphere.celebrating;
    if (!visible) return;
    const team = e.session.snapshot.preferences.team;
    if (team !== knownTeam) {
      const kit = footballKits[team];
      for (const m of primary) m.color.set(kit.shirt);
      for (const m of secondary) m.color.set(kit.trim);
      ctx.fillStyle = kit.shirt;
      ctx.fillRect(0, 0, 1024, 136);
      ctx.fillStyle = ["madrid", "amber"].includes(team)
        ? "#142352"
        : "#ffffff";
      ctx.font = "bold 64px Atkinson, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(teamThemes[team].name.toUpperCase(), 512, 68, 970);
      texture.needsUpdate = true;
      knownTeam = team;
    }
    if (!burst.visible) return;
    const t = 1 - atmosphere.remaining / 1.6;
    burst.position.set(p.to[0], 0.04, p.to[2]);
    for (let i = 0; i < burst.children.length; i++) {
      const chip = burst.children[i],
        angle = i * 2.39996;
      const radius = ((0.035 + t * 0.2) * ((i % 3) + 1)) / 3;
      chip.position.set(
        Math.cos(angle) * radius,
        0.04 + Math.sin(t * Math.PI) * (0.16 + (i % 4) * 0.025),
        Math.sin(angle) * radius,
      );
      chip.rotation.set(t * 5 + i, t * 3, angle);
      chip.scale.setScalar(Math.sqrt(1 - t));
    }
  };
}
