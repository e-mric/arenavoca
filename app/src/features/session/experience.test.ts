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
    validateContent(raw),
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
  expect(player.playing).toBe(false);
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
