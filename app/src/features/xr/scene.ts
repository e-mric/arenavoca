import { UIKitMLAsset, VisibilityState, type World } from "@iwsdk/core";
import {
  CanvasTexture,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Vector3,
  VideoTexture,
} from "@iwsdk/core";
import type { Experience } from "../session/experience";
import { drawDiagram, diagramPoint } from "../learning/diagram";
import { revealedChunks } from "../learning/tracing";
import { time } from "../../shared/dom";
export function attachXR(
  world: World,
  experience: Experience,
  fontFamilies: Awaited<ReturnType<typeof import("./font").loadCompanionFont>>,
) {
  const s = experience.session;
  world.scene.background = new Color("#101917");
  const layout = world.requireSceneObject<Group>("viewing-space");
  const stage = world.requireSceneObject<Group>("surfaces");
  const surface = (name: string) =>
    stage.getObjectByName(name) as Mesh<PlaneGeometry, MeshBasicMaterial>;
  const videoTexture = new VideoTexture(experience.player.video);
  videoTexture.colorSpace = SRGBColorSpace;
  const screen = surface("Match screen");
  screen.material = screen.material.clone();
  screen.material.map = videoTexture;
  screen.material.color.set("#ffffff");
  screen.material.needsUpdate = true;
  const frame = surface("Match frame");
  const panel = (id: string) => world.requireSceneObject<UIKitMLAsset>(id);
  const watch = panel("watch-controls"),
    learning = panel("learning"),
    explore = panel("explore"),
    welcome = panel("welcome");
  watch.document.setTargetDimensions(2.5, 0.5);
  learning.document.setTargetDimensions(0.85, 1.2);
  explore.document.setTargetDimensions(1.12, 0.94);
  welcome.document.setTargetDimensions(1.35, 1.1);
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 540;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const diagram = surface("Pass diagram");
  diagram.material = diagram.material.clone();
  diagram.material.map = texture;
  diagram.material.color.set("#ffffff");
  diagram.material.needsUpdate = true;
  const traceCanvas = document.createElement("canvas");
  traceCanvas.width = 960;
  traceCanvas.height = 540;
  const traceTexture = new CanvasTexture(traceCanvas);
  traceTexture.colorSpace = SRGBColorSpace;
  const tracePlane = surface("Trace diagram");
  tracePlane.material = tracePlane.material.clone();
  tracePlane.material.map = traceTexture;
  tracePlane.material.color.set("#ffffff");
  tracePlane.material.needsUpdate = true;
  const recenter = () => {
    const head = world.player.head;
    const position = head.getWorldPosition(new Vector3());
    const direction = head.getWorldDirection(new Vector3());
    layout.position.set(position.x, 0, position.z);
    layout.rotation.y = Math.atan2(direction.x, direction.z);
  };
  const roots = [watch, learning, explore, welcome];
  for (const root of roots)
    root.document.rootElement.setProperties({ fontFamilies });
  const find = (id: string) =>
    roots.map((p) => p.getElementById(id)).find(Boolean)!;
  const text = (id: string, value: string) =>
    find(id)?.setProperties({ text: value });
  const show = (id: string, visible: boolean) =>
    find(id)?.setProperties({ display: visible ? "flex" : "none" });
  const actions: Record<string, () => unknown> = {
    "xr-play": () => s.togglePlayback(),
    "xr-restart": () => s.restart(),
    "xr-mute": () => s.setPreference("muted", !s.snapshot.preferences.muted),
    "xr-hide": () =>
      s.setPreference("promptsHidden", !s.snapshot.preferences.promptsHidden),
    "xr-side": () =>
      s.setPreference(
        "panelSide",
        s.snapshot.preferences.panelSide === "right" ? "left" : "right",
      ),
    "xr-listen": () => experience.listen(),
    "xr-stop": () => experience.stopAudio(),
    "xr-save": () => s.save(),
    "xr-explore": () => experience.explore(),
    "xr-trace-right": () => experience.startTrace("right"),
    "xr-trace-left": () => experience.startTrace("left"),
    "xr-replay": () => experience.replay(),
    "xr-explore-listen": () => experience.listen(),
    "xr-explore-save": () => s.save(),
    "xr-back": () => experience.back(),
    "xr-start": () => s.start(),
    "xr-resume-saved": () => s.start(true),
    "xr-resume": () => s.resume(),
    "xr-watch-again": () => s.restart(),
    "xr-library": () => s.library(),
    "xr-library-back": () => experience.back(),
    "xr-exit": () => {
      s.suspend();
      world.exitXR();
    },
    "xr-recenter": () => recenter(),
  };
  const cleanups: (() => void)[] = [];
  for (const [id, action] of Object.entries(actions)) {
    const node = find(id);
    const callback = () => void action();
    node.addEventListener("click", callback);
    cleanups.push(() => node.removeEventListener("click", callback));
  }
  const origin = new Vector3();
  cleanups.push(
    world.onXRFrame((frame) => {
      if (!experience.trace.armed || s.mode !== "Exploring") return;
      const source = Array.from(world.xrSession?.inputSources ?? []).find(
        (source) => source.handedness === experience.trace.hand && source.hand,
      );
      const tip = source?.hand?.get("index-finger-tip");
      const space = world.xrReferenceSpace;
      const pose = tip && space ? frame.getJointPose?.(tip, space) : null;
      experience.trackLost = !pose;
      if (!pose) {
        experience.trace.sample({ point: [0, 0], tracked: false, depth: 0 });
        return;
      }
      world.player.indexTipSpaces[experience.trace.hand].getWorldPosition(
        origin,
      );
      tracePlane.worldToLocal(origin);
      experience.trace.sample({
        point: diagramPoint(
          origin.x / 0.98 + 0.5,
          0.5 - origin.y / ((0.98 * 9) / 16),
        ),
        depth: origin.z,
        tracked: true,
      });
    }),
  );
  cleanups.push(
    world.visibilityState.subscribe((state) => {
      document.body.classList.toggle(
        "immersive",
        state !== VisibilityState.NonImmersive,
      );
      if (
        state === VisibilityState.Hidden ||
        state === VisibilityState.VisibleBlurred
      )
        s.suspend();
    }),
  );
  world.renderer.xr.addEventListener("sessionend", () => s.suspend());
  function render() {
    const mode = s.mode;
    const watching = ["Watching", "Exploring", "Completed"].includes(mode),
      library = mode === "PhraseLibrary";
    screen.visible = watching;
    frame.visible = watching;
    watch.visible = mode === "Watching";
    learning.visible =
      (mode === "Watching" && !!s.prompt) || (library && !!s.phrase);
    diagram.visible = learning.visible;
    explore.visible = mode === "Exploring";
    tracePlane.visible = explore.visible;
    welcome.visible = [
      "Onboarding",
      "Loading",
      "Suspended",
      "Completed",
      "Error",
      "PhraseLibrary",
    ].includes(mode);
    if (library) {
      welcome.position.set(-0.7, 1.25, -1.9);
    } else welcome.position.set(0, 1.3, -1.7);
    const side = s.snapshot.preferences.panelSide === "left" ? -1 : 1;
    learning.position.x = 1.4 * side;
    diagram.position.x = learning.position.x;
    screen.position.x = -0.65 * side;
    frame.position.x = screen.position.x;
    watch.position.x = screen.position.x;
    screen.material.color.set(mode === "Exploring" ? "#687268" : "#ffffff");
    text("xr-caption", s.caption || "BLUE 0-0 AMBER / SIMULATED MATCH");
    text("xr-time", `${time(s.player.position)} / ${time(s.content.duration)}`);
    text("xr-play-label", experience.player.playing ? "Pause" : "Play");
    text("xr-mute-label", s.snapshot.preferences.muted ? "Unmute" : "Mute");
    text(
      "xr-hide-label",
      s.snapshot.preferences.promptsHidden ? "Show prompts" : "Hide prompts",
    );
    text("xr-side-label", side === 1 ? "Panel left" : "Panel right");
    text("xr-phrase", s.phrase?.spanish ?? "Follow the play.");
    text(
      "xr-meaning",
      s.phrase?.english ?? "A phrase appears during the replay.",
    );
    text("xr-learning-status", s.message);
    for (const id of ["xr-save-label", "xr-explore-save-label"])
      text(
        id,
        s.snapshot.savedPhraseIds.includes("pass")
          ? "Saved on this device"
          : "Save phrase",
      );
    show("xr-explore", !library);
    show("xr-start", mode === "Onboarding");
    show(
      "xr-resume-saved",
      mode === "Onboarding" &&
        !!s.snapshot.resumableSession &&
        !s.snapshot.resumableSession.completed,
    );
    show("xr-resume", mode === "Suspended");
    show("xr-watch-again", mode === "Completed" || mode === "Suspended");
    show("xr-library-back", library);
    text(
      "xr-welcome-status",
      mode === "Completed"
        ? "Full time. Your saved phrase stays on this device."
        : library
          ? "Your seen and saved phrases."
          : s.message,
    );
    const count = revealedChunks(experience.diagramProgress);
    text(
      "xr-chunks",
      s.content.phrases[0].chunks
        .map((c, i) => (i < count ? c : "..."))
        .join(" / "),
    );
    text(
      "xr-trace-status",
      experience.trackLost
        ? "Hand tracking lost. Bring your selected hand back."
        : experience.diagramProgress === 1
          ? "El jugador pasa el balón."
          : experience.trace.armed
            ? `Follow the ball with your ${experience.trace.hand} index finger.`
            : "Choose a hand, or select Replay action.",
    );
    if (learning.visible) {
      drawDiagram(
        canvas,
        s.content.diagrams[0],
        library ? 1 : Math.min(1, Math.max(0, (s.player.position - 12) / 3)),
      );
      texture.needsUpdate = true;
    }
    if (explore.visible) {
      drawDiagram(
        traceCanvas,
        s.content.diagrams[0],
        experience.diagramProgress,
        experience.trace.armed,
      );
      traceTexture.needsUpdate = true;
    }
  }
  render();
  world.addCleanup(() => {
    cleanups.forEach((fn) => fn());
    videoTexture.dispose();
    texture.dispose();
    traceTexture.dispose();
  });
  return render;
}
