import { it, expect, vi } from "vitest";
import raw from "../../../public/content/match.json";
import { validateContent } from "../content/model";
import { Experience } from "./experience";
import { Session } from "./session";
import { ProgressStore } from "../progress/store";
import type { MatchPlayer } from "../playback/player";
import type { Pronunciation } from "../audio/pronunciation";
async function setup() {
  const player = {
    position: 13,
    playing: true,
    video: { volume: 1 },
    play: async () => {
      player.playing = true;
    },
    pause: () => {
      player.playing = false;
    },
    restart: () => {
      player.position = 0;
    },
    restore: (p: number) => {
      player.position = p;
    },
  };
  const session = new Session(
    validateContent(structuredClone(raw)),
    player,
    new ProgressStore(() => ({ getItem: () => null, setItem: () => {} })),
  );
  session.ready();
  session.mode = "Watching";
  session.tick();
  const audio = {
    speaking: false,
    has: () => true,
    listen: vi.fn(async () => {}),
    stop: vi.fn(),
    preload: vi.fn(async () => {}),
    onChange: () => {},
  };
  const e = new Experience(
    session,
    audio as unknown as Pronunciation,
    player as unknown as MatchPlayer,
  );
  return { e, session, player, audio };
}
it("Replay completes and remains readable on subsequent frames", async () => {
  const { e, player } = await setup();
  e.explore();
  e.replay();
  for (let i = 0; i < 40; i++) e.frame(0.1);
  expect(e.diagramProgress).toBe(1);
  e.frame(0.1);
  expect(e.diagramProgress).toBe(1);
  expect(player.position).toBe(13);
  expect(player.playing).toBe(true);
});
it("match advancement and prompt expiry never replace the selected explanation", async () => {
  const { e, player, session } = await setup();
  e.explore();
  e.replay();
  player.position = 22;
  e.frame(1);
  expect(session.mode).toBe("Exploring");
  expect(session.phrase?.id).toBe("pass");
  expect(e.diagramProgress).toBeGreaterThan(0);
  expect(session.snapshot.resumableSession?.position).toBe(22);
  expect(player.playing).toBe(true);
});
it("starting trace resets Replay and selects a hand", async () => {
  const { e } = await setup();
  e.explore();
  e.replay();
  e.frame(1);
  e.startTrace("left");
  expect(e.diagramProgress).toBe(0);
  expect(e.trace.hand).toBe("left");
  expect(e.replaying).toBe(false);
  expect(e.trace.armed).toBe(true);
});
it("leaving exploration clears active tracing and Replay", async () => {
  const { e } = await setup();
  e.explore();
  e.startTrace();
  await e.back();
  e.frame(0.1);
  expect(e.trace.armed).toBe(false);
  expect(e.replaying).toBe(false);
});
it("mute changes during Spanish playback stay muted", async () => {
  const { e, audio, session, player } = await setup();
  audio.speaking = true;
  e.syncAudio();
  expect(player.video.volume).toBe(0.22);
  session.setPreference("muted", true);
  audio.speaking = false;
  e.syncAudio();
  expect(player.video.volume).toBe(0);
});
it("failed pronunciation loading does not block match playback", async () => {
  const { e, audio, session, player } = await setup();
  audio.has = () => false;
  audio.preload.mockRejectedValue(new Error("Pronunciation failed"));
  await e.listen();
  expect(session.message).toContain("failed");
  expect(player.playing).toBe(true);
});
it("Back during a pronunciation fetch never starts a stale phrase", async () => {
  const { e, audio } = await setup();
  e.explore();
  audio.has = () => false;
  let resolve!: () => void;
  audio.preload.mockImplementation(
    () =>
      new Promise<void>((r) => {
        resolve = r;
      }),
  );
  const pending = e.listen();
  await e.back();
  resolve();
  await pending;
  expect(audio.listen).not.toHaveBeenCalled();
});

it("voice coach ducks without pausing, respects mute, and releases on suspension", async () => {
  const { Coach } = await import("../coach/coach");
  const { e, session, player } = await setup();
  let events!: import("../coach/coach").CoachEvents;
  const endSession = vi.fn(async () => {});
  const coach = new Coach(async (_, callbacks) => {
    events = callbacks;
    return {
      endSession,
      setMicMuted: vi.fn(),
      sendContextualUpdate: vi.fn(),
      sendUserMessage: vi.fn(),
    };
  });
  e.attachCoach(coach);
  e.openCoach();
  await coach.start("voice");
  coach.toggleMic();
  expect(player.playing).toBe(true);
  expect(player.position).toBe(13);
  expect(player.video.volume).toBe(0.22);
  events.message("user", "Explain");
  events.speaking(true);
  session.setPreference("muted", true);
  coach.stop();
  expect(player.video.volume).toBe(0);
  expect(player.playing).toBe(true);
  await coach.start("voice");
  session.suspend();
  expect(coach.phase).toBe("off");
  expect(endSession).toHaveBeenCalledTimes(2);
});
it("opening and closing coach never resumes an explicitly paused match", async () => {
  const { Coach } = await import("../coach/coach");
  const { e, player } = await setup();
  player.pause();
  e.attachCoach(new Coach(vi.fn()));
  e.openCoach();
  e.coach!.close();
  expect(player.playing).toBe(false);
  expect(player.position).toBe(13);
});

it.each([true, false])(
  "Match Lab preserves match intent (%s), position and volume throughout its learning loop",
  async (playing) => {
    const { e, player, session } = await setup();
    session.content.version = "theater-barca-2018-full-football";
    session.content.duration = 6000;
    vi.stubGlobal("localStorage", { getItem: () => null, setItem: vi.fn() });
    player.playing = playing;
    player.position = 814;
    const volume = player.video.volume;
    e.openLab();
    expect(e.lab.open).toBe(true);
    e.changeLabCard("flip");
    e.changeLabCard("next");
    e.changeLabCard("story");
    e.labPrimary();
    e.lab.pickBall();
    e.lab.choose(0);
    for (let i = 0; i < 10; i++) e.frame(0.1);
    e.labPrimary();
    e.saveLab();
    e.closeLab();
    expect(player.playing).toBe(playing);
    expect(player.position).toBe(814);
    expect(player.video.volume).toBe(volume);
    vi.unstubAllGlobals();
  },
);
it("the lab is unavailable for unrelated sources and the original sample", async () => {
  const { e } = await setup();
  e.openLab();
  expect(e.lab.open).toBe(false);
});
it("changing cards during a pronunciation fetch prevents a stale phrase from speaking", async () => {
  const { e, session, audio } = await setup();
  session.content.version = "theater-barca-2018-full-football";
  session.content.duration = 6000;
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: vi.fn() });
  e.openLab();
  audio.has = () => false;
  let resolve!: () => void;
  audio.preload.mockImplementation(
    () =>
      new Promise<void>((r) => {
        resolve = r;
      }),
  );
  const p = e.listenLab();
  e.changeLabCard("next");
  resolve();
  await p;
  expect(audio.listen).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

it("Match Lab reports failed saving and pronunciation, then clears the notice on navigation", async () => {
  const { e, session, audio } = await setup();
  session.content.version = "theater-barca-2018-full-football";
  vi.stubGlobal("localStorage", {
    getItem: () => null,
    setItem: () => {
      throw new Error("Storage full");
    },
  });
  e.openLab();
  e.saveLab();
  expect(e.lab.saved).toBe(false);
  expect(e.lab.notice).toContain("Could not save");
  e.changeLabCard("next");
  expect(e.lab.notice).toBe("");
  audio.has = () => false;
  audio.preload.mockRejectedValueOnce(new Error("Offline"));
  await e.listenLab();
  expect(e.lab.notice).toContain("audio unavailable");
  e.changeLabCard("flip");
  expect(e.lab.notice).toBe("");
  vi.unstubAllGlobals();
});

it("generated cards, story narration and the tactical board use distinct Spanish audio", async () => {
  const { e, session, audio } = await setup();
  session.content.version = "theater-barca-2018-full-football";
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: vi.fn() });
  audio.has = () => false;
  e.openLab();
  await e.listenLab();
  expect(audio.preload).toHaveBeenLastCalledWith(
    "lab-generated-alba-cutback",
    "audio/lab-generated-alba-cutback-es.mp3",
  );
  e.changeLabCard("story");
  await e.listenLab();
  expect(audio.listen).toHaveBeenLastCalledWith(
    "lab-story-alba-generated-story-2",
  );
  e.labPrimary();
  await e.listenLab();
  expect(audio.listen).toHaveBeenLastCalledWith("alba-cutback");
  vi.unstubAllGlobals();
});

it("suspension stops analysis immediately, before the next render frame", async () => {
  const { e, session } = await setup();
  e.recognition.active = true;
  const stop = vi.spyOn(e.recognition, "stop");
  session.suspend();
  expect(stop).toHaveBeenCalledWith("Analysis stopped on exit");
  expect(e.recognition.active).toBe(false);
});
