import { attachTeamAtmosphere } from "./atmosphere-spatial";
import {
  createSystem,
  Grabbed,
  GrabSystem,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Pressed,
  Vector3,
  VisibilityState,
  type World,
} from "@iwsdk/core";
import type { Experience } from "../session/experience";
import type { SpatialWindows } from "../spatial-windows/windows";
import { TabletopTarget } from "./components";
import { goal, type TabletopPractice } from "./tabletop";
import { footballKits } from "../theme/team-theme";
import { attachPracticeCard } from "./tabletop-card";
/** IWSDK owns grabbing; this adapter only evaluates releases in pitch coordinates. */
export class TabletopInput extends createSystem({
  pressed: { required: [TabletopTarget, Pressed] },
  held: { required: [TabletopTarget, Grabbed] },
  targets: { required: [TabletopTarget] },
}) {
  practice?: TabletopPractice;
  field?: Group;
  private point = new Vector3();
  private cancelling = false;
  init() {
    this.queries.pressed.subscribe("qualify", (entity) => {
      const p = this.practice;
      if (!p?.active) return;
      const kind = entity.getValue(TabletopTarget, "kind");
      if (kind === 0) {
        for (const held of this.queries.held.entities)
          if ((held.getValue(TabletopTarget, "kind") ?? -1) >= 3) return;
        p.pickBall();
      } else if (kind === 1 || kind === 2)
        p.choose(kind === 1 ? "teammate" : "goal");
    });
    this.queries.held.subscribe("qualify", (entity) => {
      const kind = entity.getValue(TabletopTarget, "kind");
      if (kind != null && kind >= 3 && this.practice?.phase !== "ready") {
        this.world.getSystem(GrabSystem)!.forceRelease(entity);
        return;
      }
      if (kind === 0)
        for (const held of this.queries.held.entities) {
          if ((held.getValue(TabletopTarget, "kind") ?? -1) >= 3) {
            this.world.getSystem(GrabSystem)!.forceRelease(entity);
            return;
          }
        }
      if (
        entity.getValue(TabletopTarget, "kind") === 0 &&
        !this.practice?.pickBall()
      )
        this.world.getSystem(GrabSystem)!.forceRelease(entity);
    });
    this.queries.held.subscribe("disqualify", (entity) => {
      if (this.cancelling || !this.field || !this.practice?.active) return;
      entity.object3D!.getWorldPosition(this.point);
      this.field.worldToLocal(this.point);
      const kind = entity.getValue(TabletopTarget, "kind");
      if (kind === 0)
        this.practice.release([this.point.x, this.point.y, this.point.z]);
      else if (kind === 3 || kind === 4) {
        this.practice.movePlayer(kind === 3 ? "source" : "receiver", [
          this.point.x,
          this.point.y,
          this.point.z + 0.06,
        ]);
        entity.object3D!.rotation.set(
          0,
          kind === 3 ? -Math.PI / 2 : Math.PI / 2,
          0,
        );
      }
    });
  }
  releaseBall() {
    this.cancelling = true;
    for (const entity of this.queries.held.entities)
      this.world.getSystem(GrabSystem)!.forceRelease(entity);
    this.cancelling = false;
  }
}
export function attachTabletop(
  world: World,
  e: Experience,
  fontFamilies: unknown,
  windows: SpatialWindows,
) {
  const practice = e.lab.tabletop;
  const renderAtmosphere = attachTeamAtmosphere(world, e, windows);
  const field = world.requireSceneObject<Group>("tabletop-field");
  const ball = world.requireSceneObject<Group>("tabletop-ball");
  const ring = world.requireSceneObject<Group>("tabletop-ball-ring");
  const player = world.requireSceneObject<Group>("tabletop-player-source");
  const teammate = world.requireSceneObject<Group>("tabletop-player-receiver");
  const renderCard = attachPracticeCard(world, e, fontFamilies, windows);
  const aim = world.requireSceneObject<Group>("tabletop-aim");
  const receiverRing = world.requireSceneObject<Group>(
    "tabletop-receiver-ring",
  );
  const point = new Vector3(),
    direction = new Vector3(),
    up = new Vector3(0, 1, 0);
  const shirts: MeshStandardMaterial[] = [],
    trims: MeshStandardMaterial[] = [];
  for (const figure of [player, teammate])
    figure.traverse((o) => {
      if (
        o instanceof Mesh &&
        /Jersey|sleeve|Shorts|Shirt_stripe/.test(o.name)
      ) {
        const material = o.material.clone() as MeshStandardMaterial;
        o.material = material;
        (/Jersey|sleeve/.test(o.name) ? shirts : trims).push(material);
        world.addCleanup(() => material.dispose());
      }
    });
  let kitKey = "";
  const goalTarget = world.requireSceneObject<Group>("tabletop-goal");
  const goalMesh = goalTarget as unknown as Mesh;
  const goalMaterial = new MeshBasicMaterial({
    color: "#ffac86",
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
  });
  goalMesh.material = goalMaterial;
  world.addCleanup(() => goalMaterial.dispose());
  windows.bind("tabletop", field, 1.28, 0.82);
  world.registerSystem(TabletopInput);
  const input = world.getSystem(TabletopInput)!;
  input.practice = practice;
  input.field = field;
  world.addCleanup(
    world.visibilityState.subscribe((state) => {
      if (state !== VisibilityState.Visible) {
        practice.reset();
        input.releaseBall();
      }
    }),
  );
  let revision = -1;
  return () => {
    const visible = e.lab.open && e.session.matchActive && practice.active;
    const team = e.session.snapshot.preferences.team;
    if (kitKey !== team) {
      const kit = footballKits[team];
      for (const material of shirts) material.color.set(kit.shirt);
      for (const material of trims) material.color.set(kit.trim);
      kitKey = team;
    }
    field.visible = visible;
    renderCard(visible);
    renderAtmosphere(visible);
    if (!visible) {
      input.releaseBall();
      return;
    }
    if (revision !== practice.revision) {
      input.releaseBall();
      revision = practice.revision;
    }
    let held = false,
      sourceHeld = false,
      teammateHeld = false;
    for (const entity of input.queries.held.entities) {
      if (entity.object3D === ball) held = true;
      if (entity.object3D === player) sourceHeld = true;
      if (entity.object3D === teammate) teammateHeld = true;
    }
    if (!sourceHeld)
      player.position.set(practice.source[0], 0, practice.source[2] - 0.06);
    if (!teammateHeld)
      teammate.position.set(
        practice.receiver[0],
        0,
        practice.receiver[2] - 0.06,
      );
    receiverRing.position.set(
      practice.receiver[0],
      0.005,
      practice.receiver[2] - 0.06,
    );
    receiverRing.visible = practice.phase === "aiming";
    aim.visible = false;
    if (held) {
      ball.getWorldPosition(point);
      field.worldToLocal(point);
      const target = practice.aim([point.x, point.y, point.z]);
      if (target) {
        const end = target === "teammate" ? practice.receiver : goal,
          start = practice.home;
        direction.set(end[0] - start[0], 0, end[2] - start[2]);
        aim.position.set(
          (end[0] + start[0]) / 2,
          0.009,
          (end[2] + start[2]) / 2,
        );
        aim.scale.y = direction.length();
        aim.quaternion.setFromUnitVectors(up, direction.normalize());
        aim.visible = true;
      }
    }
    if (!held) {
      const t = practice.motion,
        a = practice.from,
        b = practice.to;
      ball.position.set(
        a[0] + (b[0] - a[0]) * t,
        a[1] +
          (b[1] - a[1]) * t +
          Math.sin(t * Math.PI) * (practice.action === "shoot" ? 0.075 : 0.015),
        a[2] + (b[2] - a[2]) * t,
      );
    }
    ring.position.set(ball.position.x, 0.005, ball.position.z);
    ring.visible = practice.phase === "ready" || practice.phase === "aiming";
    // A short kick and receiver response make actions visible without a physics dependency.
    const kicker = practice.action === "pass" ? player : teammate;
    const leg = kicker.getObjectByName("Right_leg");
    if (leg)
      leg.rotation.x =
        practice.phase === "moving"
          ? -Math.sin(practice.motion * Math.PI) * 0.6
          : 0;
    goalTarget.visible = visible;
  };
}
