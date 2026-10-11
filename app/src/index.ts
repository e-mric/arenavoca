import { World } from "@iwsdk/core";
import projectOptions from "virtual:iwsdk-project";
import "./styles.css";
import { loadContent } from "./features/content/model";
import { MatchPlayer } from "./features/playback/player";
import { ProgressStore } from "./features/progress/store";
import { Pronunciation } from "./features/audio/pronunciation";
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
  let world: World | undefined;
  try {
    const content = await loadContent();
    const session = new Session(content, player, new ProgressStore());
    const experience = new Experience(session, audio, player);
    const renderDesktop = bindDesktop(experience);
    let renderXR = () => {};
    experience.onChange = () => {
      renderDesktop();
      renderXR();
    };
    await player.load(content.video);
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
    try {
      world = await World.create(element("scene-container"), projectOptions);
      const fontFamilies = await loadCompanionFont();
      renderXR = attachXR(world, experience, fontFamilies);
      const vr = element<HTMLButtonElement>("enter-vr");
      const supported = await navigator.xr?.isSessionSupported("immersive-vr");
      vr.disabled = !supported;
      element("xr-status").textContent = supported
        ? "Quest 3: select Enter VR, then use hand pointing and pinch."
        : "Desktop preview · Open the secure test URL in Quest Browser to enter VR.";
      vr.addEventListener("click", () => {
        audio.stop();
        world?.launchXR();
      });
    } catch (e) {
      console.error("XR initialization failed", e);
      element("xr-status").textContent =
        "VR could not initialize. Desktop preview is available. Reload to retry VR.";
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
    world?.onXRFrame((_frame, delta) => experience.frame(delta));
    requestAnimationFrame(frame);
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
      });
  } catch (e) {
    player.destroy();
    audio.destroy();
    element("status").textContent =
      e instanceof Error ? e.message : "The prototype could not load.";
    retry.hidden = false;
    retry.onclick = () => location.reload();
  }
}
void boot();
