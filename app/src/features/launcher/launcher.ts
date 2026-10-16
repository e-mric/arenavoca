import { hasBrowserCompanion } from "./route";
import football from "../recap/artwork/res/drawable-nodpi/playmaker_football.png";
import racing from "../recap/artwork/res/drawable-nodpi/playmaker_f1.png";
import { element } from "../../shared/dom";
import type { ViewingMode } from "../xr/theater";

export function prepareLauncher() {
  const browser = hasBrowserCompanion(location.search);
  document.body.classList.toggle("xr-launcher", !browser);
  element("start").hidden = !browser;
  element<HTMLImageElement>("football-art").src = football;
  element<HTMLImageElement>("racing-art").src = racing;
}

/** Capability checks affect entry only; launching never changes match playback. */
export function enableLauncher(
  vr: boolean,
  ar: boolean,
  launch: (mode: ViewingMode) => unknown,
) {
  const room = element<HTMLInputElement>("viewer-room");
  const quiet = element<HTMLInputElement>("viewer-quiet");
  const enter = element<HTMLButtonElement>("enter-theater");
  // Choosing a space is a preference; only launching it requires XR support.
  room.disabled = false;
  quiet.disabled = false;
  if (!ar && vr) quiet.checked = true;
  if (ar && !vr) room.checked = true;
  enter.textContent = "Enter VR →";
  const update = () => {
    const selectedRoom = room.checked;
    const available = selectedRoom ? ar : vr;
    const name = selectedRoom ? "My room · Passthrough" : "Quiet space";
    enter.disabled = !available;
    element("launch-support").textContent = available
      ? `${name} selected. Enter VR, then start the match inside.`
      : `${name} selected. This browser cannot open that immersive mode. Open this page in Quest Browser, or use the separate VR emulator window on this Mac.`;
  };
  room.onchange = update;
  quiet.onchange = update;
  update();
  enter.onclick = () => {
    const mode = room.checked ? "passthrough" : "theater";
    if (mode === "passthrough" ? ar : vr) void launch(mode);
  };
}
