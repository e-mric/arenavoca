import fs from "node:fs";
const style = `<style>
@font-face { font-family: 'Atkinson'; font-weight: 400; src: url('../fonts/AtkinsonHyperlegible-Regular.ttf'); font-weight: 400; }
.fs-root { font-family: 'Atkinson'; font-weight: 400; flex-direction: column; background-color: #1c2821; border-radius: 18px; padding: 24px; color: #edf3e8; gap: 12px; }
.fs-title { font-family: 'Atkinson'; font-weight: 400; font-size: 32px; color: #d5e5d0; }
.fs-body { font-family: 'Atkinson'; font-weight: 400; font-size: 24px; color: #b5c9b5; }
.fs-row { flex-direction: row; gap: 12px; align-items: center; justify-content: center; }
.fs-button { background-color: #304537; min-height: 62px; border-radius: 10px; padding: 10px; }
.fs-label { font-family: 'Atkinson'; font-weight: 400; font-size: 25px; color: #edf3e8; }
.fs-space { height: 275px; }
</style>`;
const button = (id, label) =>
  `<Button id="${id}" class="fs-button"><ButtonLabel id="${id}-label" class="fs-label">${label}</ButtonLabel></Button>`;
const row = (s) => `<div class="fs-row">${s}</div>`;
const ui = {
  "watch-controls": `${style}<div class="fs-root" style="width: 1100px; height: 220px"><span id="xr-caption" class="fs-body">Original simulated match</span><span id="xr-time" class="fs-body">00:00 / 00:30</span>${row(button("xr-play", "Play") + button("xr-restart", "Restart") + button("xr-mute", "Mute") + button("xr-library", "Your phrases") + button("xr-hide", "Hide prompts") + button("xr-side", "Panel left"))}</div>`,
  learning: `${style}<div class="fs-root" style="width: 600px; height: 820px"><div class="fs-title">THE PASS</div><div class="fs-space"></div><span id="xr-phrase" class="fs-title">Follow the play.</span><span id="xr-meaning" class="fs-body">A phrase appears during the replay.</span>${row(button("xr-listen", "Listen") + button("xr-stop", "Stop audio"))}${row(button("xr-save", "Save phrase") + button("xr-explore", "Explore action"))}<span id="xr-learning-status" class="fs-body"></span></div>`,
  explore: `${style}<div class="fs-root" style="width: 1000px; height: 830px"><div class="fs-body">MATCH PAUSED / TRACE THE PASS</div><span id="xr-chunks" class="fs-title">Follow the pass to reveal the sentence</span><div class="fs-space" style="height: 420px"></div><span id="xr-trace-status" class="fs-body">Choose a hand, then follow the ball.</span>${row(button("xr-trace-right", "Trace right hand") + button("xr-trace-left", "Trace left hand") + button("xr-replay", "Replay action"))}${row(button("xr-explore-listen", "Listen") + button("xr-explore-save", "Save phrase") + button("xr-back", "Back to match"))}</div>`,
  welcome: `${style}<div class="fs-root" style="width: 850px; height: 650px"><div class="fs-title">FOOTBALL SPANISH COMPANION</div><div class="fs-body">Watch an original passing play. Trace the action and connect it to Spanish.</div><div class="fs-body">Point at a control and pinch to select it. Spanish audio plays only when you choose Listen. You can hide learning prompts.</div><span id="xr-welcome-status" class="fs-body">Preparing your match...</span>${row(button("xr-start", "Start match") + button("xr-resume-saved", "Resume previous"))}${row(button("xr-resume", "Resume match") + button("xr-watch-again", "Watch again"))}${row(button("xr-library-back", "Back to match") + button("xr-recenter", "Recenter") + button("xr-exit", "Exit VR"))}</div>`,
};
for (const [name, markup] of Object.entries(ui))
  fs.writeFileSync(`public/ui/${name}.uikitml`, markup);
