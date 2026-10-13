import {
  AssetManager,
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  SRGBColorSpace,
  UIKitMLAsset,
  Vector3,
  VideoTexture,
  type World,
} from "@iwsdk/core";
import type { Experience } from "../session/experience";
import { companionPlacement } from "../xr/placement";
import { MatchLabInput } from "./input";
import { labFeedbackColor, labPrimaryLabel, labStep } from "./presentation";
import type { SpatialWindows } from "../spatial-windows/windows";
import { attachHandheldCard } from "./handheld";
import { cutback } from "./lab";
/** Scene-authored board, markers and controls all follow the same world anchor. */
export function attachMatchLab(
  world: World,
  e: Experience,
  fontFamilies: unknown,
  windows: SpatialWindows,
) {
  const panel = world.requireSceneObject<UIKitMLAsset>("match-lab");
  const board = world.requireSceneObject<Group>("lab-board");
  const ball = world.requireSceneObject<Mesh>("lab-ball");
  const players = [0, 1, 2].map((i) =>
    world.requireSceneObject<Group>(`lab-player-${i}`),
  );
  const replay = world.requireSceneObject<Mesh>("lab-replay-screen");
  const layout = world.requireSceneObject<Group>("window-match-lab");
  windows.bind("match-lab", panel, 1.15, 1.15 * 1.46);
  const renderCard = attachHandheldCard(world, e, windows);
  panel.document.rootElement.setProperties({
    fontFamilies: fontFamilies as never,
  });
  const nodes = new Map<string, ReturnType<typeof panel.requireElementById>>();
  const node = (id: string) => {
    let found = nodes.get(id);
    if (!found) {
      found = panel.requireElementById(id);
      nodes.set(id, found);
    }
    return found;
  };
  const textValues = new Map<string, string>();
  const text = (id: string, value: string) => {
    if (textValues.get(id) !== value) {
      node(id).setProperties({ text: value });
      textValues.set(id, value);
    }
  };
  const cleanups: (() => void)[] = [];
  const actions: Record<string, () => unknown> = {
    "lab-flip": () => e.changeLabCard("flip"),
    "lab-next": () => e.changeLabCard("next"),
    "lab-previous": () => e.changeLabCard("previous"),
    "lab-story": () => e.changeLabCard("story"),
    "lab-browse": () => e.changeLabCard("browse"),
    "lab-close": () => e.closeLab(),
    "lab-listen": () => e.listenLab(),
    "lab-replay": () => e.replayLab(),
    "lab-primary": () => e.labPrimary(),
    "lab-save": () => e.saveLab(),
    "lab-demo": () => {
      e.labReplay?.stop();
      e.lab.demonstrate();
    },
    "lab-side": () =>
      e.session.setPreference(
        "panelSide",
        e.session.snapshot.preferences.panelSide === "right" ? "left" : "right",
      ),
    "lab-distance": () =>
      e.session.setPreference(
        "panelDistance",
        e.session.snapshot.preferences.panelDistance === "near"
          ? "far"
          : "near",
      ),
    "lab-height": () =>
      e.session.setPreference(
        "panelHeight",
        e.session.snapshot.preferences.panelHeight === "low" ? "high" : "low",
      ),
  };
  for (const [id, action] of Object.entries(actions)) {
    const cb = () => void action();
    node(id).addEventListener("click", cb);
    cleanups.push(() => node(id).removeEventListener("click", cb));
  }
  world.registerSystem(MatchLabInput);
  world.getSystem(MatchLabInput)!.activate = (index) => {
    if (!panel.visible || e.labReplay?.visible) return;
    if (index === -3 && e.lab.view === "cards") {
      e.changeLabCard("flip");
      return;
    }
    if (e.lab.view !== "activity") return;
    if (index === -1) e.lab.pickBall();
    else e.lab.choose(index);
  };
  const textures: CanvasTexture[] = [];
  for (let i = 0; i < 3; i++) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#4975ed";
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = "#fff4ed";
    ctx.font = "bold 88px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ABC"[i], 64, 68);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    textures.push(texture);
    const label = players[i].getObjectByName("Marker label") as Mesh;
    label.material = new MeshBasicMaterial({ map: texture });
  }
  ball.material = (ball.material as MeshBasicMaterial).clone();
  replay.material = (replay.material as MeshBasicMaterial).clone();
  const origin = new Vector3(),
    offset = new Vector3();
  const probes = new Map<string, ReturnType<World["createTransformEntity"]>>();
  if (import.meta.env.DEV)
    for (const id of Object.keys(actions)) {
      const marker = new Group();
      marker.name = `lab-target/${id}`;
      probes.set(id, world.createTransformEntity(marker));
    }
  let videoTexture: VideoTexture | undefined;
  let placementKey = "";
  let lastCards: boolean | undefined;
  let panelWidth = 1.15;
  let lastFeedback = "",
    lastBackground = "";
  const place = (obj: Group | Mesh, x: number, y: number, z: number) =>
    obj.position
      .copy(origin)
      .add(
        offset
          .set(x * board.scale.x, y * board.scale.x, z * board.scale.x + 0.035)
          .applyQuaternion(panel.quaternion),
      );
  function render() {
    const lab = e.lab;
    panel.visible = lab.open && e.session.matchActive;
    renderCard();
    const showingReplay = !!e.labReplay?.visible;
    const cards = lab.view === "cards";
    board.visible = ball.visible =
      panel.visible && !cards && lab.phase !== "observe" && !showingReplay;
    for (const player of players) player.visible = board.visible;
    replay.visible = panel.visible && !cards && showingReplay;
    if (!panel.visible) return;
    const pref = e.session.snapshot.preferences,
      key = `${pref.panelSide}/${pref.panelHeight}/${pref.panelDistance}`;
    if (key !== placementKey) {
      const pose = companionPlacement(pref);
      const clearance = pref.panelDistance === "near" ? 0.12 : 0.4;
      windows.place(
        "match-lab",
        pose.x + (pref.panelSide === "left" ? -clearance : clearance),
        pose.y,
        pose.z,
        pref.panelSide === "left" ? 0.55 : -0.55,
        pose.width,
        pose.width * 1.46,
      );
      panelWidth = pose.width;
      panel.document.setTargetDimensions(
        panelWidth,
        panelWidth * (cards ? 0.95 : 1.46),
      );
      windows.size("match-lab", panelWidth, panelWidth * (cards ? 0.95 : 1.46));
      for (const obj of [board, ball, ...players, replay]) {
        obj.scale.setScalar((pose.width / 1.12) * 0.88);
        obj.quaternion.copy(panel.quaternion);
      }
      placementKey = key;
    }
    world.scene.updateMatrixWorld(true);
    node("lab-board-area").getWorldPosition(origin);
    layout.worldToLocal(origin);
    board.position
      .copy(origin)
      .add(offset.set(0, 0, 0.035).applyQuaternion(panel.quaternion));
    for (let i = 0; i < 3; i++)
      place(
        players[i],
        lab.arrangement.players[i][0],
        lab.arrangement.players[i][1],
        0.055,
      );
    const start = lab.arrangement.ball,
      end =
        lab.selected === null ? start : lab.arrangement.players[lab.selected];
    place(
      ball,
      start[0] + (end[0] - start[0]) * lab.motion,
      start[1] + (end[1] - start[1]) * lab.motion,
      0.105,
    );
    (ball.material as MeshBasicMaterial).color.set(
      lab.armed ? "#ff9988" : "#fff4ed",
    );
    place(replay, 0, 0, 0.06);
    if (e.labReplay && !videoTexture) {
      videoTexture = new VideoTexture(e.labReplay.video);
      videoTexture.colorSpace = SRGBColorSpace;
      (replay.material as MeshBasicMaterial).map = videoTexture;
      (replay.material as MeshBasicMaterial).needsUpdate = true;
    }
    const material = replay.material as MeshBasicMaterial;
    const nextMap = showingReplay
      ? videoTexture!
      : AssetManager.getTexture(`lab-art-${lab.cards.card.id}`);
    if (material.map !== nextMap) {
      material.map = nextMap;
      material.needsUpdate = true;
    }
    text("lab-step", cards ? lab.cards.label : labStep(lab));
    text(
      "lab-phrase",
      cards
        ? lab.cards.flipped
          ? lab.cards.english
          : lab.cards.spanish
        : cutback.spanish,
    );
    text(
      "lab-translation",
      cards
        ? lab.cards.flipped
          ? "TRANSLATION / flip back to practise"
          : "SPANISH / flip to reveal the translation"
        : lab.translation
          ? cutback.english
          : "Select the ball, then a teammate.",
    );
    text(
      "lab-direction",
      cards
        ? `Match clock ${lab.cards.card.evidence.matchClock}`
        : lab.arrangement.attack === 1
          ? "ATTACK RIGHT > / toward the coral goal"
          : "< ATTACK LEFT / toward the coral goal",
    );
    text(
      "lab-message",
      e.labReplay?.error ||
        lab.notice ||
        (showingReplay
          ? e.labReplay!.status
          : cards
            ? lab.saved
              ? "Phrase saved on this device."
              : "Pinch the card to hold it. Turn it over for English. Two hands resize. Spanish review pending."
            : lab.message),
    );
    text(
      "lab-primary-label",
      cards ? "Practise cutback" : labPrimaryLabel(lab),
    );
    text("lab-save-label", lab.saved ? "Saved" : "Save phrase");
    text("lab-flip-label", lab.cards.flipped ? "Spanish side" : "Flip card");
    text("lab-story-label", lab.cards.storyMode ? "Single card" : "Read story");
    if (cards !== lastCards) {
      node("lab-card-nav").setProperties({ display: cards ? "flex" : "none" });
      node("lab-board-area").setProperties({
        display: cards ? "none" : "flex",
      });
      panel.document.rootElement.setProperties({ height: cards ? 950 : 1460 });
      node("lab-browse").setProperties({ display: cards ? "none" : "flex" });
      node("lab-demo").setProperties({ display: cards ? "none" : "flex" });
      panel.document.setTargetDimensions(
        panelWidth,
        panelWidth * (cards ? 0.95 : 1.46),
      );
      windows.size("match-lab", panelWidth, panelWidth * (cards ? 0.95 : 1.46));
      lastCards = cards;
    }
    const feedback = cards ? "#432c36" : labFeedbackColor(lab);
    const background = cards
      ? lab.cards.flipped
        ? "#17453e"
        : "#281922"
      : lab.phase === "choose"
        ? "#281922"
        : labFeedbackColor(lab);
    if (feedback !== lastFeedback) {
      node("lab-feedback").setProperties({ backgroundColor: feedback });
      lastFeedback = feedback;
    }
    if (background !== lastBackground) {
      panel.document.rootElement.setProperties({ backgroundColor: background });
      lastBackground = background;
    }
    for (const [id, probe] of probes)
      if (probe.object3D) node(id).getWorldPosition(probe.object3D.position);
  }
  world.addCleanup(() => {
    cleanups.forEach((fn) => fn());
    textures.forEach((t) => t.dispose());
    videoTexture?.dispose();
    (ball.material as MeshBasicMaterial).dispose();
    (replay.material as MeshBasicMaterial).dispose();
    for (const player of players)
      (
        (player.getObjectByName("Marker label") as Mesh)
          .material as MeshBasicMaterial
      ).dispose();
  });
  return render;
}
