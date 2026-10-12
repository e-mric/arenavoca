import { World } from "@iwsdk/core";
import projectOptions from "virtual:iwsdk-project";
import "./styles.css";
import { loadContent } from "./features/content/model";
import { MatchPlayer } from "./features/playback/player";
import { ProgressStore } from "./features/progress/store";
import { Pronunciation } from "./features/audio/pronunciation";
import { Commentary } from "./features/audio/commentary";
import { Session } from "./features/session/session";
import { Experience } from "./features/session/experience";
import { bindDesktop } from "./features/session/desktop";
import { loadCompanionFont } from "./features/xr/font";
import { attachXR } from "./features/xr/scene";
import { element } from "./shared/dom";
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
    const content = await loadContent();
    const session = new Session(content, player, new ProgressStore());
    const experience = new Experience(session, audio, player, commentary);
    const renderDesktop = bindDesktop(experience);
    let renderXR = () => {};
    experience.onChange = () => {
      renderDesktop();
      renderXR();
    };
    await player.load(content.video);
    try {
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
      const nativeXR = await navigator.xr?.isSessionSupported("immersive-vr");
      if (!nativeXR && !import.meta.env.DEV) {
        element("xr-status").textContent =
          "Desktop preview · Open the secure test URL in Quest Browser to enter VR.";
      } else {
        world = await World.create(element("scene-container"), projectOptions);
        const fontFamilies = await loadCompanionFont();
        renderXR = attachXR(world, experience, fontFamilies);
        const vr = element<HTMLButtonElement>("enter-vr");
        const supported =
          await navigator.xr?.isSessionSupported("immersive-vr");
        vr.disabled = !supported;
        element("xr-status").textContent = supported
          ? "Quest 3: select Enter VR, then use hand pointing and pinch."
          : "Desktop preview · Open the secure test URL in Quest Browser to enter VR.";
        vr.addEventListener("click", () => {
          audio.stop();
          world?.launchXR();
        });
      }
    } catch (e) {
      console.error("XR initialization failed", e);
      element("xr-status").textContent =
        "VR could not initialize. Desktop preview is available. Reload to retry VR.";
    }
    world?.onXRFrame((_frame, delta) => experience.frame(delta));
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) session.suspend();
    });
    window.addEventListener("pagehide", () => {
      session.persist();
      audio.stop();
    });
    player.video.addEventListener("error", () =>
      session.fail("The match could not play. Reload to retry."),
    );
    if (import.meta.hot)
      import.meta.hot.dispose(() => {
        active = false;
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
  }
}
void boot();
