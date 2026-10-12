import "../../styles.css";
import "./styles.css";
import { sourceById, youtubeUrl, type StreamSource } from "./catalog";
import { loadYouTubeAPI, StreamPlayback, youtubeError } from "./youtube";
import { streamLessons, drawStreamLesson } from "../sports/practice";
import { StreamStore } from "./progress";
import {
  validWatchMessage,
  validRoom,
  type WatchState,
  type WatchCommand,
} from "./bridge";
import { teamThemes, themeFor, type Team } from "../theme/team-theme";
import { PassTrace } from "../learning/tracing";
import { Pronunciation } from "../audio/pronunciation";
import { time } from "../../shared/dom";
const q = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id)! as T;
const params = new URLSearchParams(location.search);
const companion = params.get("view") === "companion";
const room = validRoom(params.get("room"))
  ? params.get("room")!
  : crypto.randomUUID();
let source = sourceById(params.get("source"));
let lesson = streamLessons[source.sport];
let trace = new PassTrace(lesson.route),
  progress = 0,
  replaying = false,
  pointer: number | undefined;
let last = performance.now(),
  listenRequest = 0,
  apiReady = false,
  player: StreamPlayback | undefined;
let remoteSpeaking = false,
  ducked = false,
  baseVolume = 100,
  expectedVolume = 100;
let lastChildSeen = 0,
  lastMasterSeen = 0,
  detached = false,
  active = true;
let appliedTheme = "",
  appliedLesson = "",
  bookmarkSignature = "";
let childWindow: Window | null = null;
let autoplayBlocked = false;
let localLearningStatus = "";
const store = new StreamStore(),
  audio = new Pronunciation();
const profile = store.read();
let state: WatchState = {
  kind: "state",
  source: source.id,
  team: profile.teams[source.id],
  position: 0,
  duration: 0,
  playing: false,
  ready: false,
  saved: profile.saved.includes(source.id),
  bookmarks: profile.bookmarks
    .filter((b) => b.source === source.id)
    .map((b) => b.position),
  error: "",
  learningStatus: "",
};
const bus =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel(`sports-spanish.watch.${room}`)
    : undefined;
q("desktop").classList.toggle("companion-only", companion);
q("companion-close").hidden = !companion;
q<HTMLButtonElement>("detach-companion").disabled = !bus;
q<HTMLSelectElement>("source-select").value = source.id;
function applyTheme() {
  const key = `${source.id}/${state.team}`;
  if (key === appliedTheme) return;
  const theme = themeFor(state.team, source.sport),
    root = q("desktop");
  root.dataset.sport = source.sport;
  root.dataset.team = state.team;
  for (const [key, value] of Object.entries(theme))
    if (key !== "name" && key !== "sport")
      root.style.setProperty(`--team-${key}`, value);
  q("stream-identity").textContent =
    `${source.sport === "f1" ? "F1" : "Football"} · ${theme.name}`;
  q<HTMLSelectElement>("stream-team").replaceChildren(
    ...source.teams.map((team) => {
      const option = document.createElement("option");
      option.value = team;
      option.textContent = teamThemes[team].name;
      return option;
    }),
  );
  q<HTMLSelectElement>("stream-team").value = state.team;
  appliedTheme = key;
}
function audioVolume() {
  if (!apiReady || !player) return;
  const speaking = audio.speaking || remoteSpeaking,
    current = player.player.getVolume();
  if (speaking) {
    if (!ducked) baseVolume = current;
    else if (Math.abs(current - expectedVolume) > 1) baseVolume = current;
    expectedVolume = baseVolume * 0.22;
    player.player.setVolume(expectedVolume);
    ducked = true;
  } else if (ducked) {
    if (Math.abs(current - expectedVolume) > 1) baseVolume = current;
    player.player.setVolume(baseVolume);
    ducked = false;
  }
}
function send(command: WatchCommand) {
  bus?.postMessage(command);
}
function stopAudio() {
  listenRequest++;
  audio.stop();
}
audio.onChange = () => {
  if (companion)
    send({
      kind: "command",
      source: source.id,
      action: "speaking",
      speaking: audio.speaking,
    });
  else audioVolume();
};
function updateSource(next: StreamSource) {
  stopAudio();
  remoteSpeaking = false;
  if (!companion) audioVolume();
  autoplayBlocked = false;
  localLearningStatus = "";
  source = next;
  lesson = streamLessons[next.sport];
  trace = new PassTrace(lesson.route);
  progress = 0;
  replaying = false;
  appliedLesson = "";
  bookmarkSignature = "";
  const p = store.read();
  state = {
    ...state,
    source: source.id,
    team: p.teams[source.id],
    saved: p.saved.includes(source.id),
    bookmarks: p.bookmarks
      .filter((b) => b.source === source.id)
      .map((b) => b.position),
    position: 0,
    duration: 0,
    playing: false,
    ready: false,
    error: "",
    learningStatus: "",
  };
  if (!companion && player) player.source(source);
  history.replaceState(
    null,
    "",
    `?source=${source.id}${companion ? `&view=companion&room=${room}` : ""}`,
  );
  render();
}
function execute(command: WatchCommand) {
  if (command.source !== source.id) return;
  if (command.action === "toggle" && state.ready) player?.toggle();
  if (command.action === "bookmark" && state.ready && player) {
    const ok = store.bookmark(source.id, player.position);
    state.learningStatus = ok
      ? "This game moment is saved on your device."
      : "Could not save this moment. Please retry.";
  }
  if (command.action === "save")
    state.learningStatus = store.savePhrase(source.id)
      ? "Phrase saved on this device."
      : "Could not save the phrase. Please retry.";
  if (
    command.action === "team" &&
    command.team &&
    source.teams.includes(command.team)
  ) {
    state.team = command.team;
    if (!store.team(source.id, command.team))
      state.learningStatus =
        "Your colours changed, but could not be stored on this device.";
  }
  if (command.action === "speaking") {
    remoteSpeaking = !!command.speaking;
    audioVolume();
  }
  if (command.action === "hello") lastChildSeen = performance.now();
  if (command.action === "bye") {
    lastChildSeen = 0;
    detached = false;
    remoteSpeaking = false;
    audioVolume();
  }
  const p = store.read();
  state.saved = p.saved.includes(source.id);
  state.bookmarks = p.bookmarks
    .filter((b) => b.source === source.id)
    .map((b) => b.position);
  render();
  if (!companion) bus?.postMessage(state);
}
function action(action: WatchCommand["action"], team?: Team) {
  localLearningStatus = "";
  const command: WatchCommand = {
    kind: "command",
    source: source.id,
    action,
    team,
  };
  if (
    companion &&
    bus &&
    lastMasterSeen > 0 &&
    performance.now() - lastMasterSeen < 5000
  )
    send(command);
  else execute(command);
}
if (bus)
  bus.onmessage = (event) => {
    if (!validWatchMessage(event.data)) return;
    const message = event.data;
    if (companion && message.kind === "state") {
      if (message.source !== source.id)
        updateSource(sourceById(message.source));
      state = message;
      lastMasterSeen = performance.now();
      render();
    } else if (!companion && message.kind === "command") execute(message);
  };
function render() {
  applyTheme();
  q("source-title").textContent = source.title;
  q("source-uploader").textContent = `Source uploader: ${source.uploader}`;
  q("companion-source").textContent =
    source.sport === "f1" ? "F1 COMPANION" : "MATCH COMPANION";
  q<HTMLAnchorElement>("youtube-link").href = youtubeUrl(source);
  q<HTMLButtonElement>("stream-play").disabled = !state.ready;
  q<HTMLButtonElement>("companion-play").disabled =
    !state.ready ||
    (companion &&
      (!lastMasterSeen || performance.now() - lastMasterSeen > 5000));
  q<HTMLButtonElement>("stream-bookmark").disabled =
    !state.ready ||
    (companion &&
      (!lastMasterSeen || performance.now() - lastMasterSeen > 5000));
  q("stream-play").textContent = state.playing ? "Pause game" : "Play game";
  q("companion-play").textContent = state.playing ? "Pause game" : "Play game";
  q("stream-time").textContent =
    `${time(state.position)} / ${state.duration ? time(state.duration) : "--:--"}`;
  q("stream-status").textContent =
    state.error ||
    (autoplayBlocked ? "Select Play in the YouTube player to begin." : "") ||
    (state.ready
      ? state.playing
        ? "Game playing · Learning is optional."
        : "YouTube connected. Select Play in the player."
      : "Connecting to YouTube…");
  q("connection-status").textContent =
    companion && (!lastMasterSeen || performance.now() - lastMasterSeen > 5000)
      ? "Open this companion from the game window to connect its clock. Lessons remain available."
      : state.ready
        ? `${state.playing ? "Playing" : "Paused"} · ${time(state.position)} · Learning never changes playback.`
        : "Lessons remain available while the game connects.";
  q("stream-save").textContent = state.saved
    ? "Saved on this device"
    : "Save phrase";
  q("learning-status").textContent =
    localLearningStatus || state.learningStatus;
  q("stream-layout").classList.toggle("detached", !companion && detached);
  q("inline-companion").hidden = !detached;
  if (appliedLesson !== lesson.id) {
    q("lesson-name").textContent = `PRACTICE · ${lesson.name.toUpperCase()}`;
    q("lesson-spanish").textContent = lesson.spanish;
    q("lesson-english").textContent = lesson.english;
    q("stream-chunks").replaceChildren(
      ...lesson.chunks.map((chunk) => {
        const span = document.createElement("span");
        span.textContent = chunk;
        return span;
      }),
    );
    appliedLesson = lesson.id;
  }
  q("stream-chunks")
    .querySelectorAll("span")
    .forEach((span, i) =>
      span.classList.toggle(
        "revealed",
        progress >= 1 || i < Math.ceil(progress * lesson.chunks.length),
      ),
    );
  q("stream-trace-status").textContent =
    progress === 1
      ? lesson.spanish
      : trace.armed
        ? "Drag or pinch along the path from A to B."
        : "Replay or trace the illustration while the game continues.";
  drawStreamLesson(q<HTMLCanvasElement>("stream-diagram"), lesson, progress);
  const signature = `${source.id}/${state.ready}/${state.bookmarks.join("/")}`;
  if (signature !== bookmarkSignature) {
    q("stream-bookmarks").replaceChildren(
      ...state.bookmarks.map((position) => {
        const button = document.createElement("button");
        button.textContent = `Jump to ${time(position)}`;
        button.disabled = companion || !state.ready;
        button.onclick = () => player?.seek(position);
        return button;
      }),
    );
    bookmarkSignature = signature;
  }
}
q("source-select").addEventListener("change", () =>
  updateSource(sourceById(q<HTMLSelectElement>("source-select").value)),
);
q("stream-team").addEventListener("change", () =>
  action("team", q<HTMLSelectElement>("stream-team").value as Team),
);
q("stream-play").onclick = () => action("toggle");
q("companion-play").onclick = () => action("toggle");
q("stream-save").onclick = () => action("save");
q("stream-bookmark").onclick = () => action("bookmark");
q("stream-replay").onclick = () => {
  trace.reset();
  progress = 0;
  replaying = true;
  render();
};
q("stream-trace").onclick = () => {
  replaying = false;
  progress = 0;
  trace.start();
  render();
};
q("stream-stop").onclick = stopAudio;
q("stream-listen").onclick = async () => {
  localLearningStatus = "";
  const requested = lesson,
    request = ++listenRequest;
  try {
    if (!audio.has(requested.id))
      await audio.preload(requested.id, requested.audio);
    if (request !== listenRequest || lesson.id !== requested.id) return;
    await audio.listen(requested.id);
    state.learningStatus = "";
  } catch {
    localLearningStatus =
      "Pronunciation could not load. You can still read, replay, trace and save.";
    render();
  }
};
const canvas = q<HTMLCanvasElement>("stream-diagram");
function sample(event: PointerEvent) {
  const box = canvas.getBoundingClientRect();
  progress = trace.sample({
    point: [
      (event.clientX - box.left) / box.width,
      (event.clientY - box.top) / box.height,
    ],
    depth: 0,
    tracked: true,
  });
  render();
}
canvas.addEventListener("pointerdown", (e) => {
  if (!trace.armed) return;
  pointer = e.pointerId;
  canvas.setPointerCapture(pointer);
  sample(e);
});
canvas.addEventListener("pointermove", (e) => {
  if (pointer === e.pointerId) sample(e);
});
for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
  canvas.addEventListener(type, () => {
    pointer = undefined;
  });
q("detach-companion").onclick = () => {
  stopAudio();
  const url = new URL("watch.html", location.href);
  url.search = new URLSearchParams({
    source: source.id,
    view: "companion",
    room,
  }).toString();
  childWindow = window.open(
    url.href,
    `sports-companion-${room}`,
    "popup,width=560,height=900",
  );
  state.learningStatus = childWindow
    ? "Place the companion window where you prefer."
    : "The popup was blocked. The companion remains beside the game.";
  render();
};
q("inline-companion").onclick = () => {
  childWindow?.close();
  childWindow = null;
  lastChildSeen = 0;
  detached = false;
  remoteSpeaking = false;
  audioVolume();
  render();
};
q("companion-close").onclick = () => {
  stopAudio();
  send({ kind: "command", source: source.id, action: "bye" });
  window.close();
};
async function connect() {
  apiReady = false;
  state.ready = false;
  state.error = "";
  autoplayBlocked = false;
  render();
  try {
    const api = await loadYouTubeAPI();
    player?.player.destroy();
    q("youtube-player")?.remove();
    const slot = document.createElement("div");
    slot.id = "youtube-player";
    q("player-pane").prepend(slot);
    const instance = new api.Player("youtube-player", {
      videoId: source.videoId,
      width: "100%",
      height: "100%",
      playerVars: {
        origin: location.origin,
        playsinline: 1,
        controls: 1,
        rel: 0,
        hl: "en",
      },
      events: {
        onReady: () => {
          apiReady = true;
          render();
        },
        onStateChange: () => {
          if (apiReady) {
            if (player?.playing) autoplayBlocked = false;
            render();
          }
        },
        onError: (e) => {
          state.error = youtubeError(e.data);
          state.ready = false;
          render();
        },
        onAutoplayBlocked: () => {
          autoplayBlocked = true;
          render();
        },
      },
    });
    player = new StreamPlayback(instance);
  } catch (error) {
    state.error =
      error instanceof Error ? error.message : "YouTube could not connect.";
    render();
  }
}
q("retry-youtube").onclick = () => void connect();
const ticker = setInterval(() => {
  if (companion) {
    send({ kind: "command", source: source.id, action: "hello" });
    render();
    return;
  }
  if (apiReady && player) {
    const selected = player.videoId === source.videoId;
    state.position = selected ? player.position : 0;
    state.duration = selected ? player.duration : 0;
    state.playing = selected && player.playing;
    state.ready = selected && !state.error;
    audioVolume();
  }
  detached = !!lastChildSeen && performance.now() - lastChildSeen < 5000;
  if (!detached && remoteSpeaking) {
    remoteSpeaking = false;
    audioVolume();
  }
  render();
  bus?.postMessage(state);
}, 250);
function frame(now: number) {
  if (!active) return;
  const delta = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (replaying) {
    progress = Math.min(1, progress + delta / 3);
    if (progress === 1) replaying = false;
    render();
  }
  requestAnimationFrame(frame);
}
render();
requestAnimationFrame(frame);
if (!companion) void connect();
else send({ kind: "command", source: source.id, action: "hello" });
window.addEventListener("pagehide", () => {
  active = false;
  clearInterval(ticker);
  audio.destroy();
  if (companion) send({ kind: "command", source: source.id, action: "bye" });
  bus?.close();
});
