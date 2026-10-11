import { element, time } from "../../shared/dom";
import { drawDiagram, diagramPoint } from "../learning/diagram";
import { revealedChunks } from "../learning/tracing";
import type { Experience } from "./experience";
export function bindDesktop(experience: Experience) {
  const s = experience.session;
  element("video-mount").append(experience.player.video);
  const handlers: Record<string, () => unknown> = {
    start: () => s.start(),
    "resume-saved": () => s.start(true),
    play: () => s.togglePlayback(),
    restart: () => s.restart(),
    "stop-audio": () => experience.stopAudio(),
    explore: () => experience.explore(),
    listen: () => experience.listen(),
    save: () => s.save(),
    "explore-listen": () => experience.listen(),
    "explore-save": () => s.save(),
    "trace-start": () => experience.startTrace(),
    replay: () => experience.replay(),
    back: () => experience.back(),
    library: () => s.library(),
    "library-back": () => experience.back(),
    "library-listen": () => experience.listen(),
    "library-save": () => s.save(),
    "completed-library": () => s.library(),
    "completed-restart": () => s.restart(),
    resume: () => s.resume(),
    "suspended-restart": () => s.restart(),
    mute: () => s.setPreference("muted", !s.snapshot.preferences.muted),
    "hide-prompts": () =>
      s.setPreference("promptsHidden", !s.snapshot.preferences.promptsHidden),
  };
  for (const [id, action] of Object.entries(handlers))
    element(id).addEventListener("click", () => void action());
  const canvas = element<HTMLCanvasElement>("trace-diagram");
  let pointer: number | undefined;
  canvas.addEventListener("pointerdown", (e) => {
    if (!experience.trace.armed) return;
    pointer = e.pointerId;
    canvas.setPointerCapture(pointer);
    sample(e);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (pointer === e.pointerId) sample(e);
  });
  const release = () => {
    pointer = undefined;
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("lostpointercapture", release);
  function sample(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    experience.trace.sample({
      point: diagramPoint(
        (e.clientX - r.left) / r.width,
        (e.clientY - r.top) / r.height,
      ),
      depth: 0,
      tracked: true,
    });
    experience.diagramProgress = experience.trace.progress;
    render();
  }
  function render() {
    const mode = s.mode,
      loaded = mode !== "Loading" && mode !== "Error";
    element("intro").hidden =
      mode !== "Onboarding" && mode !== "Loading" && mode !== "Error";
    element("experience").hidden = !loaded || mode === "Onboarding";
    element<HTMLButtonElement>("start").disabled = !loaded;
    element("start").textContent = loaded
      ? "Start match →"
      : "Preparing your match…";
    element("resume-saved").hidden =
      !s.snapshot.resumableSession || s.snapshot.resumableSession.completed;
    element("watch-layout").hidden = ["PhraseLibrary", "Suspended"].includes(
      mode,
    );
    element("watch-layout").classList.toggle("dimmed", mode === "Exploring");
    element("watch-layout").classList.toggle(
      "left",
      s.snapshot.preferences.panelSide === "left",
    );
    element("explore-view").hidden = mode !== "Exploring";
    element("library-view").hidden = mode !== "PhraseLibrary";
    element("completed").hidden = mode !== "Completed";
    element("suspended").hidden = mode !== "Suspended";
    element("waiting").hidden = !!s.prompt;
    element("phrase-card").hidden = !s.prompt;
    element("time").textContent =
      `${time(experience.player.position)} / ${time(s.content.duration)}`;
    element<HTMLProgressElement>("match-progress").value =
      experience.player.position;
    element("caption").textContent = s.caption;
    element("play").textContent = experience.player.playing ? "Pause" : "Play";
    element("mute").textContent = s.snapshot.preferences.muted
      ? "Unmute"
      : "Mute";
    element("hide-prompts").textContent = s.snapshot.preferences.promptsHidden
      ? "Show prompts"
      : "Hide prompts";
    element("stop-audio").hidden = !experience.audio.speaking;
    element("status").textContent = s.message;
    element("saved-count").textContent = String(
      s.snapshot.savedPhraseIds.length,
    );
    const saved = s.snapshot.savedPhraseIds.includes("pass");
    for (const id of ["save", "explore-save", "library-save"])
      element(id).textContent = saved ? "Saved ✓" : "Save phrase";
    for (const id of ["listen", "explore-listen", "library-listen"])
      element(id).textContent = experience.audio.speaking
        ? "Listen again"
        : "Listen";
    const eligible = s.exposure.phrases.has("pass") || saved;
    element("library-empty").hidden = eligible;
    element("library-phrase").hidden = !eligible;
    element("library-status").textContent = saved
      ? "Saved on this device."
      : "Seen this session. Select Save phrase to keep it.";
    element("mode-label").textContent =
      mode === "Exploring"
        ? "EXPLORE & CONNECT"
        : mode === "PhraseLibrary"
          ? "KEEP THE CONNECTION"
          : "WATCH & LEARN";
    const chunks = revealedChunks(experience.diagramProgress);
    element("chunks")
      .querySelectorAll("span")
      .forEach((node, i) => node.classList.toggle("revealed", i < chunks));
    element("trace-instruction").textContent = experience.trackLost
      ? "Hand tracking lost. Bring your selected hand back to continue."
      : experience.diagramProgress === 1
        ? "El jugador pasa el balón. You followed the pass."
        : experience.trace.armed
          ? "Follow the ball from player 7 to player 9."
          : experience.replaying
            ? "Watch the pass unfold."
            : "Choose Start trace, then follow the ball from player 7 to player 9.";
    if (mode === "Exploring")
      drawDiagram(
        canvas,
        s.content.diagrams[0],
        experience.diagramProgress,
        experience.trace.armed,
      );
    if (s.prompt)
      drawDiagram(
        element<HTMLCanvasElement>("watch-diagram"),
        s.content.diagrams[0],
        Math.min(1, (s.player.position - s.prompt.promptStart) / 3),
      );
  }
  render();
  return render;
}
