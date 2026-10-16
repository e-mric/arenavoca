import {
  createSystem,
  Grabbed,
  GrabSystem,
  Group,
  Mesh,
  MeshBasicMaterial,
  Pressed,
  UIKitMLAsset,
  Vector3,
  VisibilityState,
  type World,
} from "@iwsdk/core";
import type { Experience } from "../session/experience";
import type { SpatialWindows } from "../spatial-windows/windows";
import { TabletopTarget } from "./components";
import type { TabletopPractice } from "./tabletop";
/** IWSDK owns grabbing; this adapter only evaluates releases in pitch coordinates. */
export class TabletopInput extends createSystem({
  pressed: { required: [TabletopTarget, Pressed] },
  held: { required: [TabletopTarget, Grabbed] },
  targets: { required: [TabletopTarget] },
}) {
  practice?: TabletopPractice;
  field?: Group;
  private point = new Vector3();
  init() {
    this.queries.pressed.subscribe("qualify", (entity) => {
      const p = this.practice;
      if (!p?.active) return;
      const kind = entity.getValue(TabletopTarget, "kind");
      if (kind === 0) p.pickBall();
      else p.choose(kind === 1 ? "teammate" : "goal");
    });
    this.queries.held.subscribe("qualify", (entity) => {
      if (
        entity.getValue(TabletopTarget, "kind") === 0 &&
        !this.practice?.pickBall()
      )
        this.world.getSystem(GrabSystem)!.forceRelease(entity);
    });
    this.queries.held.subscribe("disqualify", (entity) => {
      if (
        entity.getValue(TabletopTarget, "kind") !== 0 ||
        !this.field ||
        !this.practice?.active
      )
        return;
      entity.object3D!.getWorldPosition(this.point);
      this.field.worldToLocal(this.point);
      this.practice.release([this.point.x, this.point.y, this.point.z]);
    });
  }
  releaseBall() {
    for (const entity of this.queries.held.entities)
      this.world.getSystem(GrabSystem)!.forceRelease(entity);
  }
}
export function attachTabletop(
  world: World,
  e: Experience,
  fontFamilies: unknown,
  windows: SpatialWindows,
) {
  const practice = e.lab.tabletop;
  const field = world.requireSceneObject<Group>("tabletop-field");
  const ball = world.requireSceneObject<Group>("tabletop-ball");
  const ring = world.requireSceneObject<Group>("tabletop-ball-ring");
  const player = world.requireSceneObject<Group>("tabletop-player-source");
  const teammate = world.requireSceneObject<Group>("tabletop-player-receiver");
  const panel = world.requireSceneObject<UIKitMLAsset>("tabletop-lesson");
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
  windows.bind("tabletop-lesson", panel, 0.65, 0.57);
  panel.document.rootElement.setProperties({
    fontFamilies: fontFamilies as never,
  });
  panel.document.setTargetDimensions(0.65, 0.57);
  world.registerSystem(TabletopInput);
  const input = world.getSystem(TabletopInput)!;
  input.practice = practice;
  input.field = field;
  const node = (id: string) => panel.requireElementById(id);
  const actions: Record<string, () => void> = {
    "table-hint": () => {
      practice.translation = !practice.translation;
    },
    "table-retry": () => {
      practice.primary();
    },
    "table-back": () => e.lab.browse(),
    "table-close": () => e.closeLab(),
  };
  for (const [id, fn] of Object.entries(actions)) {
    node(id).addEventListener("click", fn);
    world.addCleanup(() => node(id).removeEventListener("click", fn));
  }
  world.addCleanup(
    world.visibilityState.subscribe((state) => {
      if (state !== VisibilityState.Visible) {
        practice.reset();
        input.releaseBall();
      }
    }),
  );
  const values = new Map<string, string>();
  const text = (id: string, value: string) => {
    if (values.get(id) !== value) {
      node(id).setProperties({ text: value });
      values.set(id, value);
    }
  };
  let revision = -1;
  return () => {
    const visible = e.lab.open && e.session.matchActive && practice.active;
    field.visible = panel.visible = visible;
    if (!visible) {
      input.releaseBall();
      return;
    }
    if (revision !== practice.revision) {
      input.releaseBall();
      revision = practice.revision;
    }
    text(
      "table-step",
      practice.action === "pass" ? "1 / PASS BACK" : "2 / SHOOT AT GOAL",
    );
    text("table-phrase", practice.spanish);
    text(
      "table-translation",
      practice.translation
        ? practice.english
        : "Reveal the translation when you need it",
    );
    text("table-message", practice.message);
    text("table-primary", practice.primaryLabel);
    text(
      "table-hint-label",
      practice.translation ? "Hide translation" : "Translation",
    );
    node("table-feedback").setProperties({
      backgroundColor:
        practice.phase === "feedback"
          ? practice.success
            ? "#24483a"
            : "#61352e"
          : "#432c36",
    });
    let held = false;
    for (const entity of input.queries.held.entities)
      if (entity.object3D === ball) held = true;
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
    player.rotation.y = Math.PI * 0.5;
    teammate.rotation.y = Math.PI * 0.5;
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
