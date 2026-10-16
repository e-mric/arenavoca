import { Coach } from "./features/coach/coach";
import { connectCoach } from "./features/coach/elevenlabs";
import { World, SessionMode } from "@iwsdk/core";
import projectOptions from "virtual:iwsdk-project";
import "./styles.css";
import "./features/launcher/styles.css";
import { prepareLauncher, enableLauncher } from "./features/launcher/launcher";
import { loadContent } from "./features/content/model";
import { MatchPlayer } from "./features/playback/player";
import { ProgressStore, PROGRESS_KEY } from "./features/progress/store";
import {
  loadTheaterSource,
  theaterPracticeContent,
} from "./features/content/theater-source";
import { theaterName, type ViewingMode } from "./features/xr/theater";
import { Pronunciation } from "./features/audio/pronunciation";
import { Commentary } from "./features/audio/commentary";
import { Session } from "./features/session/session";
import { Experience } from "./features/session/experience";
import { bindDesktop } from "./features/session/desktop";
import { loadCompanionFont, loadCardTypeface } from "./features/xr/font";
import { attachMinimalXR } from "./features/match-moments/xr";
import { element } from "./shared/dom";
prepareLauncher();
async function boot() {
  const retry = element("retry");
  retry.hidden = true;
  const player = new MatchPlayer();
  const audio = new Pronunciation();
  const spanishTrack = document.createElement("audio");
  spanishTrack.dataset.commentary = "spanish";
  document.body.append(spanishTrack);
  const commentary = new Commentary(spanishTrack);
  let world: World | undefined;
  try {
    const source = await loadTheaterSource();
    let content = await loadContent();
    if (source.kind === "video") {
      await player.loadStream(source.video);
      content = theaterPracticeContent(source, player.video.duration);
    }
    const session = new Session(
      content,
      player,
      new ProgressStore(
        undefined,
        source.kind === "video" ? `${PROGRESS_KEY}.${source.id}` : PROGRESS_KEY,
      ),
    );
    const experience = new Experience(session, audio, player, commentary);
    experience.attachCoach(new Coach(connectCoach));
    const renderDesktop = bindDesktop(experience);
    let renderXR = () => {};
    experience.onChange = () => {
      renderDesktop();
      renderXR();
    };
    if (source.kind === "sample") await player.load(content.video);
    try {
      if (source.kind === "sample")
        await commentary.load("audio/commentary-es.mp3");
    } catch {
      /* English remains available. */
    }
    try {
      await audio.preload(
        content.phrases[0].id,
        content.phrases[0].pronunciation,
      );
    } catch {
      session.message =
        "Pronunciation could not load. You can still watch; retry with Listen.";
    }
    session.ready();
    if (source.kind === "video") {
      session.setSport(source.sport);
      session.setPreference("commentaryLanguage", "english");
    }
    element("media-source-label").textContent =
      content.title ?? "Calibration clip · Original football play · 30 seconds";
    element("media-badge").textContent =
      source.kind === "video"
        ? "IMMERSIVE SPORTS VIDEO"
        : "CALIBRATION CLIP / 30 SECONDS";
    if (source.kind === "video") {
      element("source-guidance").textContent =
        "Choose your team colours, then enter Quiet space or My room (passthrough). Read pre-match stories, then receive cards as the action happens.";
      element("commentary-guidance").textContent =
        "The match keeps its source commentary. Choose Listen for Spanish pronunciation. Practice concepts are selected manually; they are not detected events in the recording.";
    }
    element("experience-title").textContent = content.title ?? theaterName;
    if (
      !commentary.ready &&
      session.snapshot.preferences.commentaryLanguage === "spanish"
    ) {
      session.message =
        "Spanish commentary could not load. English is available.";
      session.setPreference("commentaryLanguage", "english");
    }
    let last = performance.now(),
      active = true;
    function frame(now: number) {
      if (!active) return;
      const delta = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!world?.xrSession) experience.frame(delta);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    try {
      const [nativeVR, nativeAR] = await Promise.all([
        navigator.xr?.isSessionSupported("immersive-vr"),
        navigator.xr?.isSessionSupported("immersive-ar"),
      ]);
      const nativeXR = nativeVR || nativeAR;
      if (!nativeXR && !import.meta.env.DEV) {
        element("enter-theater").textContent = "Enter VR →";
        enableLauncher(false, false, () => {});
        element("xr-status").textContent =
          "Open the secure test URL in Quest Browser to enter VR.";
      } else {
        world = await World.create(element("scene-container"), projectOptions);
        const fontFamilies = await loadCompanionFont();
        await loadCardTypeface();
        let viewingMode: ViewingMode = "theater";
        renderXR = attachMinimalXR(
          world,
          experience,
          fontFamilies,
          () => viewingMode,
        );
        const vr = element<HTMLButtonElement>("enter-vr");
        if (source.kind !== "sample") vr.textContent = "Quiet space ↗";
        const supported =
          await navigator.xr?.isSessionSupported("immersive-vr");
        const passthrough = element<HTMLButtonElement>("enter-passthrough");
        passthrough.disabled =
          !(await navigator.xr?.isSessionSupported("immersive-ar"));
        vr.disabled = !supported;
        element("xr-status").textContent = supported
          ? "Choose Quiet space or My room (passthrough), then point and pinch to select."
          : "Open the secure test URL in Quest Browser to enter VR.";
        const launch = async (mode: ViewingMode) => {
          viewingMode = mode;
          renderXR();
          experience.stopAudio();
          try {
            await world?.launchXR({
              sessionMode:
                mode === "passthrough"
                  ? SessionMode.ImmersiveAR
                  : SessionMode.ImmersiveVR,
            });
          } catch (error) {
            element("xr-status").textContent =
              `Could not enter ${mode === "passthrough" ? "My room" : "the theater"}. Try again in Quest Browser.`;
            console.error(error);
          }
        };
        vr.addEventListener("click", () => void launch("theater"));
        enableLauncher(!!supported, !passthrough.disabled, launch);
        passthrough.addEventListener("click", () => void launch("passthrough"));
      }
    } catch (e) {
      enableLauncher(false, false, () => {});
      console.error("XR initialization failed", e);
      element("xr-status").textContent =
        "VR could not initialize. Reload to retry or open this page in Quest Browser.";
    }
    world?.onXRFrame((_frame, delta) => experience.frame(delta));
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) session.suspend();
    });
    window.addEventListener("pagehide", () => {
      session.persist();
      experience.stopAudio();
    });
    player.video.addEventListener("error", () =>
      session.fail("The match could not play. Reload to retry."),
    );
    if (import.meta.hot)
      import.meta.hot.dispose(() => {
        active = false;
        experience.coach?.close();
        experience.labReplay?.destroy();
        world?.destroy();
        player.destroy();
        audio.destroy();
        commentary.destroy();
        spanishTrack.remove();
      });
  } catch (e) {
    player.destroy();
    audio.destroy();
    commentary.destroy();
    spanishTrack.remove();
    element("status").textContent =
      e instanceof Error ? e.message : "The prototype could not load.";
    retry.hidden = false;
    retry.onclick = () => location.reload();
    element("use-sample").hidden = false;
    element("use-sample").onclick = () => {
      location.search = "?sample=1";
    };
  }
}
void boot();
