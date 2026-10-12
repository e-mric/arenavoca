import { element, time } from "../../shared/dom";
import {
  drawContentDiagram,
  contentDiagramPoint,
  contentChunkCount,
} from "../learning/content-diagram";

import type { Experience } from "./experience";
import { activeWord } from "../karaoke/karaoke";
import { teamThemes, themeFor } from "../theme/team-theme";
// Keep stable text nodes across frames. Replacing unchanged text forces layout
// work throughout the companion even after an animation has finished.
function text(node: HTMLElement, value: string) {
  if (node.textContent !== value) node.textContent = value;
}
function hidden(node: HTMLElement, value: boolean) {
  if (node.hidden !== value) node.hidden = value;
}
export function bindDesktop(experience: Experience) {
  const s = experience.session;
  element("video-mount").append(experience.player.video);
  const companion = element("companion");
  companion.append(element("explore-view"), element("library-view"));
  const handlers: Record<string, () => unknown> = {
    "coach-open": () => experience.openCoach(),
    "coach-voice": () => experience.coach?.start("voice"),
    "coach-text": () => experience.coach?.start("text"),
    "coach-mic": () => experience.coach?.toggleMic(),
    "coach-explain": () => experience.coach?.ask("explain"),
    "coach-slow": () => experience.coach?.ask("slow"),
    "coach-practice": () => experience.coach?.ask("practice"),
    "coach-spanish": () => experience.coach?.ask("spanish"),
    "coach-end": () => experience.coach?.stop(),
    "coach-close": () => experience.coach?.close(),
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
    "panel-side": () =>
      s.setPreference(
        "panelSide",
        s.snapshot.preferences.panelSide === "right" ? "left" : "right",
      ),
    "panel-distance": () =>
      s.setPreference(
        "panelDistance",
        s.snapshot.preferences.panelDistance === "near" ? "far" : "near",
      ),
    "panel-height": () =>
      s.setPreference(
        "panelHeight",
        s.snapshot.preferences.panelHeight === "low" ? "high" : "low",
      ),
    "team-blue": () => s.setPreference("team", "blue"),
    "team-amber": () => s.setPreference("team", "amber"),
    "team-neutral": () => s.setPreference("team", "neutral"),
    "karaoke-toggle": () =>
      s.setPreference("karaokeEnabled", !s.snapshot.preferences.karaokeEnabled),
    "karaoke-hide": () => s.setPreference("karaokeEnabled", false),
    "sport-football": () => s.setSport("football"),
    "sport-f1": () => s.setSport("f1"),
    "team-barcelona": () => s.setPreference("team", "barcelona"),
    "team-madrid": () => s.setPreference("team", "madrid"),
    "team-ferrari": () => s.setPreference("team", "ferrari"),
    "team-mclaren": () => s.setPreference("team", "mclaren"),
    "commentary-english": () => experience.setCommentaryLanguage("english"),
    "commentary-spanish": () => experience.setCommentaryLanguage("spanish"),
  };
  for (const [id, action] of Object.entries(handlers))
    element(id).addEventListener("click", () => void action());
  element("coach-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = element<HTMLInputElement>("coach-question");
    experience.coach?.ask(input.value);
    input.value = "";
  });
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
  let appliedTheme = "",
    drawnExplore = -1,
    drawnArmed = false,
    drawnWatch = -1;
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("lostpointercapture", release);
  function sample(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    experience.trace.sample({
      point: contentDiagramPoint(
        s.content,
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
    const phrase = s.content.phrases[0];
    element<HTMLProgressElement>("match-progress").max = s.content.duration;
    for (const node of document.querySelectorAll<HTMLElement>(
      "#phrase-card h2, #library-phrase h3",
    ))
      text(node, phrase.spanish);
    for (const node of document.querySelectorAll<HTMLElement>(
      "#phrase-card .translation, #library-phrase p",
    ))
      text(node, phrase.english);
    hidden(element("commentary-spanish"), !!s.content.manualPractice);
    text(
      element("commentary-english"),
      s.content.manualPractice ? "Source audio" : "English",
    );
    const mode = s.mode,
      loaded = mode !== "Loading" && mode !== "Error";
    hidden(
      element("intro"),
      mode !== "Onboarding" && mode !== "Loading" && mode !== "Error",
    );
    hidden(element("experience"), !loaded || mode === "Onboarding");
    element<HTMLButtonElement>("start").disabled = !loaded;
    text(element("start"), loaded ? "Start match →" : "Preparing your match…");
    hidden(
      element("resume-saved"),
      !s.snapshot.resumableSession || s.snapshot.resumableSession.completed,
    );
    hidden(element("watch-layout"), mode === "Suspended");
    const coach = experience.coach;
    const coaching = !!coach?.open;
    hidden(element("coach-card"), !coaching);
    if (coach) {
      text(element("coach-phrase"), coach.context?.phrase ?? "");
      text(element("coach-status"), coach.status);
      text(element("coach-reply"), coach.reply);
      text(element("coach-heard"), coach.heard ? `You: ${coach.heard}` : "");
      text(element("coach-notice"), coach.notice);
      hidden(
        element("coach-starts"),
        coach.phase === "ready" || coach.phase === "connecting",
      );
      hidden(element("coach-actions"), coach.phase !== "ready");
      hidden(
        element("coach-end"),
        coach.phase !== "ready" && coach.phase !== "connecting",
      );
      hidden(element("coach-mic"), coach.mode !== "voice");
      element<HTMLButtonElement>("coach-mic").disabled = coach.speaking;
      text(
        element("coach-mic"),
        coach.listening ? "Done speaking" : "Speak a question",
      );
    }
    const companionOpen =
      coaching || mode === "Exploring" || mode === "PhraseLibrary";
    element("watch-layout").classList.toggle("companion-open", companionOpen);
    element("watch-layout").classList.toggle(
      "left",
      s.snapshot.preferences.panelSide === "left",
    );
    hidden(element("explore-view"), mode !== "Exploring" || coaching);
    hidden(element("library-view"), mode !== "PhraseLibrary" || coaching);
    hidden(element("completed"), mode !== "Completed");
    hidden(element("suspended"), mode !== "Suspended");
    hidden(element("waiting"), companionOpen || !!s.prompt || !!s.chant);
    hidden(element("phrase-card"), companionOpen || !s.prompt);
    text(
      element("time"),
      `${time(experience.player.position)} / ${time(s.content.duration)}`,
    );
    element<HTMLProgressElement>("match-progress").value =
      experience.player.position;
    text(element("caption"), s.caption);
    text(element("play"), experience.player.playing ? "Pause" : "Play");
    element("play").setAttribute(
      "aria-label",
      experience.player.playing ? "Pause match" : "Play match",
    );
    text(
      element("explore-playback-status"),
      experience.player.position >= s.content.duration - 0.04
        ? "MATCH FINISHED · KEEP EXPLORING"
        : experience.player.playing
          ? "MATCH PLAYING · EXPLORE THE PASS"
          : "MATCH PAUSED BY YOU · EXPLORE THE PASS",
    );
    text(
      element("panel-side"),
      s.snapshot.preferences.panelSide === "right"
        ? "Panel left"
        : "Panel right",
    );
    text(
      element("panel-distance"),
      s.snapshot.preferences.panelDistance === "near"
        ? "Panel farther"
        : "Panel nearer",
    );
    text(
      element("panel-height"),
      s.snapshot.preferences.panelHeight === "low"
        ? "Panel higher"
        : "Panel lower",
    );
    for (const team of Object.keys(teamThemes))
      element(`team-${team}`).setAttribute(
        "aria-pressed",
        String(s.snapshot.preferences.team === team),
      );
    const preferences = s.snapshot.preferences;
    for (const sport of ["football", "f1"]) {
      element<HTMLButtonElement>(`sport-${sport}`).disabled =
        !!s.content.manualPractice && s.content.sport !== sport;
      element(`sport-${sport}`).setAttribute(
        "aria-pressed",
        String(preferences.sport === sport),
      );
      hidden(element(`${sport}-teams`), preferences.sport !== sport);
    }
    hidden(element("team-blue"), !!s.content.manualPractice);
    hidden(element("team-amber"), !!s.content.manualPractice);
    hidden(element("karaoke-toggle"), !!s.content.manualPractice);
    for (const language of ["english", "spanish"])
      element(`commentary-${language}`).setAttribute(
        "aria-pressed",
        String(preferences.commentaryLanguage === language),
      );
    const themeKey = `${preferences.team}/${preferences.sport}`;
    if (themeKey !== appliedTheme) {
      const theme = themeFor(preferences.team, preferences.sport);
      const surface = element("desktop");
      surface.dataset.sport = preferences.sport;
      surface.dataset.team = preferences.team;
      for (const [key, value] of Object.entries(theme))
        if (key !== "name" && key !== "sport")
          surface.style.setProperty(`--team-${key}`, value);
      text(
        element("team-identity"),
        `${preferences.sport === "f1" ? "F1" : "Football"} · ${theme.name}`,
      );
      appliedTheme = themeKey;
    }
    element("karaoke-toggle").setAttribute(
      "aria-pressed",
      String(s.snapshot.preferences.karaokeEnabled),
    );
    text(
      element("karaoke-toggle"),
      s.snapshot.preferences.karaokeEnabled
        ? "Chant lyrics on"
        : "Enable chant lyrics",
    );
    const chant = s.chant;
    hidden(element("karaoke-card"), !chant || coaching);
    if (chant) {
      const word = activeWord(chant, s.player.position);
      element("karaoke-lyrics")
        .querySelectorAll("span")
        .forEach((node, i) => {
          text(node, chant.words[i] ?? "");
          hidden(node, i >= chant.words.length);
          node.classList.toggle("current-word", i === word);
        });
      text(element("karaoke-translation"), chant.translation);
    }
    text(element("mute"), s.snapshot.preferences.muted ? "Unmute" : "Mute");
    text(
      element("hide-prompts"),
      s.snapshot.preferences.promptsHidden ? "Show prompts" : "Hide prompts",
    );
    hidden(element("stop-audio"), !experience.audio.speaking);
    text(element("status"), s.message);
    text(element("saved-count"), String(s.snapshot.savedPhraseIds.length));
    const saved = s.snapshot.savedPhraseIds.includes(s.content.phrases[0].id);
    for (const id of ["save", "explore-save", "library-save"])
      text(element(id), saved ? "Saved ✓" : "Save phrase");
    for (const id of ["listen", "explore-listen", "library-listen"])
      text(element(id), experience.audio.speaking ? "Listen again" : "Listen");
    const eligible = s.exposure.phrases.has(s.content.phrases[0].id) || saved;
    hidden(element("library-empty"), eligible);
    hidden(element("library-phrase"), !eligible);
    text(
      element("library-status"),
      saved
        ? "Saved on this device."
        : "Seen this session. Select Save phrase to keep it.",
    );
    text(
      element("mode-label"),
      mode === "Exploring"
        ? "EXPLORE & CONNECT"
        : mode === "PhraseLibrary"
          ? "KEEP THE CONNECTION"
          : "WATCH & LEARN",
    );
    const chunks = contentChunkCount(s.content, experience.diagramProgress);
    element("chunks")
      .querySelectorAll("span")
      .forEach((node, i) => {
        text(node, s.content.phrases[0].chunks[i] ?? "");
        hidden(node, i >= s.content.phrases[0].chunks.length);
        node.classList.toggle("revealed", i < chunks);
      });
    text(
      element("trace-instruction"),
      experience.trackLost
        ? "Hand tracking lost. Bring your selected hand back to continue."
        : experience.diagramProgress === 1
          ? `${s.content.phrases[0].spanish} You followed the ${s.content.phrases[0].action}.`
          : experience.trace.armed
            ? "Follow the ball from player 7 to player 9."
            : experience.replaying
              ? "Watch the pass unfold."
              : "Choose Start trace, then follow the ball from player 7 to player 9.",
    );
    if (
      mode === "Exploring" &&
      (drawnExplore !== experience.diagramProgress ||
        drawnArmed !== experience.trace.armed)
    ) {
      drawnExplore = experience.diagramProgress;
      drawnArmed = experience.trace.armed;
      drawContentDiagram(
        canvas,
        s.content,
        experience.diagramProgress,
        experience.trace.armed,
      );
    }
    if (s.prompt) {
      const watchProgress = Math.min(
        1,
        (s.player.position - s.prompt.promptStart) / 3,
      );
      if (watchProgress !== drawnWatch) {
        drawnWatch = watchProgress;
        drawContentDiagram(
          element<HTMLCanvasElement>("watch-diagram"),
          s.content,
          watchProgress,
        );
      }
    }
  }
  render();
  return render;
}
