import {
  Group,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
  UIKitMLAsset,
  type Object3D,
  type World,
} from "@iwsdk/core";
import type { Experience } from "../session/experience";
import { labCards } from "../match-lab/cards";
import { GoalCelebration } from "./celebration";
import { CelebrationPose } from "./celebration-pose";
import { CelebrationStatus } from "./components";
import { CelebrationMotion } from "./celebration-motion";

/** Optional companion; its only connection to the match player is observation. */
export function attachGoalCelebration(
  world: World,
  e: Experience,
  fonts: unknown,
) {
  // Only reviewed prepared goals, never unreviewed AI drafts or unrelated packs.
  const goals = labCards
    .filter((c) => c.id === "coutinho-goal")
    .map((c) => ({ id: c.id, endSeconds: c.evidence.endSeconds }));
  const state = new GoalCelebration(goals);
  const pose = new CelebrationPose();
  const root = world.requireSceneObject<Group>("goal-celebration-root");
  const guides = world.requireSceneObject<Group>("celebration-guides");
  const handGuides = ["celebration-left-hand", "celebration-right-hand"].map(
    (id) => world.requireSceneObject<Group>(id),
  );
  const fills = handGuides.map((guide) => {
    const mesh = guide.getObjectByName("PalmFill") as Mesh;
    const material = (mesh.material as MeshBasicMaterial).clone();
    mesh.material = material;
    world.addCleanup(() => material.dispose());
    return material;
  });
  const guideHit = [false, false];
  const headPosition = new Vector3(),
    headRotation = new Quaternion(),
    parentRotation = new Quaternion();
  const up = new Vector3(0, 1, 0);
  let placedInvitation = 0,
    manipulating = false,
    progress = -1;
  const player = world.requireSceneObject<Object3D>("goal-celebration-player");
  const left = player.getObjectByName("CelebrateLeftArm")!;
  const right = player.getObjectByName("CelebrateRightArm")!;
  const head = player.getObjectByName("CelebrateHead")!;
  if (!left || !right || !head)
    throw new Error("Celebration asset is missing its articulation pivots.");
  const motion = new CelebrationMotion(left, right, head, player);
  const panel = world.requireSceneObject<UIKitMLAsset>("goal-celebration");
  panel.document.setTargetDimensions(0.6, 0.16);
  panel.document.rootElement.setProperties({ fontFamilies: fonts as never });
  const title = panel.requireElementById("celebration-title");
  const instruction = panel.requireElementById("celebration-instruction");
  const surface = panel.requireElementById("celebration-surface");
  const progressBar = panel.requireElementById("celebration-progress");
  const dismiss = panel.requireElementById("celebration-dismiss");
  const close = () => state.cancel();
  dismiss.addEventListener("click", close);
  world.addCleanup(() => dismiss.removeEventListener("click", close));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const marker = new Group();
  marker.name = "celebration-state";
  const status = world.createTransformEntity(marker);
  status.addComponent(CelebrationStatus);
  let label = "";
  function render() {
    root.visible = world.renderer.xr.isPresenting && state.phase !== "idle";
    guides.visible = root.visible && pose.anchored;
    const celebrating = state.phase === "celebrating";
    for (let i = 0; i < handGuides.length; i++) {
      handGuides[i].visible = !celebrating;
      const hit =
        !manipulating && (i === 0 ? pose.leftInPlace : pose.rightInPlace);
      if (hit !== guideHit[i]) {
        fills[i].color.setHex(hit ? 0x2855ff : 0xded8ff);
        fills[i].opacity = hit ? 0.9 : 0.28;
        guideHit[i] = hit;
      }
    }
    motion.update(celebrating, state.age, reduced.matches);
    const hint = celebrating
      ? "Celebrate!"
      : manipulating
        ? "Release the window first"
        : !pose.tracked
          ? "Bring both hands into view"
          : state.needsFreshPose
            ? "Lower hands, then raise again"
            : pose.raised
              ? "Hold there..."
              : "Raise your hands here";
    const key = `${state.phase}/${state.demo}/${hint}`;
    if (key !== label) {
      title.setProperties({
        text: celebrating
          ? "Celebra!"
          : state.demo
            ? "Try celebration"
            : "Gol!",
      });
      instruction.setProperties({
        text: hint,
      });
      surface.setProperties({
        backgroundColor: celebrating ? "#ddd8ff" : "#fffaf2",
      });
      label = key;
    }
    const nextProgress = celebrating ? 1 : Math.min(1, state.held / 0.35);
    if (nextProgress !== progress) {
      progressBar.setProperties({ width: 260 * nextProgress });
      progress = nextProgress;
    }
    status.setValue(CelebrationStatus, "enabled", state.enabled);
    status.setValue(CelebrationStatus, "phase", state.phase);
    status.setValue(CelebrationStatus, "goalId", state.goalId);
    status.setValue(CelebrationStatus, "tracked", pose.tracked);
    status.setValue(CelebrationStatus, "raised", pose.raised);
    status.setValue(
      CelebrationStatus,
      "leftInPlace",
      pose.leftInPlace && !manipulating,
    );
    status.setValue(
      CelebrationStatus,
      "rightInPlace",
      pose.rightInPlace && !manipulating,
    );
    status.setValue(CelebrationStatus, "holdProgress", nextProgress);
    status.setValue(CelebrationStatus, "recordingSeconds", e.player.position);
    status.setValue(CelebrationStatus, "playing", e.player.playing);
  }
  render();
  return {
    state,
    render,
    frame(frame: XRFrame, delta: number, blocked: boolean) {
      const space = world.renderer.xr.getReferenceSpace();
      state.update(
        e.player.position,
        e.player.playing,
        e.player.video.seeking,
        e.labAvailable && e.session.matchActive,
        delta,
      );
      manipulating = blocked;
      if (space)
        pose.read(
          frame,
          space,
          state.phase === "idle" ? 0 : state.invitationId,
        );
      else pose.clear();
      if (pose.anchored && placedInvitation !== state.invitationId) {
        // Freeze a world-space guide at the invitation pose, never parent to the head.
        world.player.head.getWorldPosition(headPosition);
        world.player.head.getWorldQuaternion(headRotation);
        const yaw = Math.atan2(
          2 *
            (headRotation.w * headRotation.y + headRotation.x * headRotation.z),
          1 - 2 * (headRotation.x ** 2 + headRotation.y ** 2),
        );
        guides.position.copy(headPosition);
        guides.quaternion.setFromAxisAngle(up, yaw);
        if (guides.parent) {
          guides.parent.worldToLocal(guides.position);
          guides.parent.getWorldQuaternion(parentRotation).invert();
          guides.quaternion.premultiply(parentRotation);
        }
        placedInvitation = state.invitationId;
      }
      state.observe(pose.raised, pose.tracked, blocked, delta);
      render();
    },
  };
}
