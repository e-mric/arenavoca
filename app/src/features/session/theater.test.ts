import { expect, it } from "vitest";
import { Session } from "./session";
import { ProgressStore } from "../progress/store";
import { theaterPracticeContent } from "../content/theater-source";
import type { Playback } from "../playback/player";
const source = {
  kind: "video",
  id: "game",
  title: "Game",
  sport: "football",
  video: "media/user/game.mp4",
} as const;
it("manual practice remains available after the short authored prompt window while the match keeps running", async () => {
  const player: Playback & { position: number; playing: boolean } = {
    position: 0,
    playing: false,
    async play() {
      this.playing = true;
    },
    pause() {
      this.playing = false;
    },
    restart() {
      this.position = 0;
      this.playing = false;
    },
    restore(t) {
      this.position = t;
      this.playing = false;
    },
  };
  const memory = new Map<string, string>();
  const session = new Session(
    theaterPracticeContent(source, 6000),
    player,
    new ProgressStore(() => ({
      getItem: (k) => memory.get(k) ?? null,
      setItem: (k, v) => {
        memory.set(k, v);
      },
    })),
  );
  session.ready();
  await session.start();
  player.position = 3000;
  session.tick();
  expect(session.prompt?.id).toBe("manual-practice");
  session.explore();
  expect(player.playing).toBe(true);
  player.position = 3008;
  session.tick();
  await session.back();
  expect(player.position).toBe(3008);
  expect(player.playing).toBe(true);
  session.setPreference("promptsHidden", true);
  session.tick();
  expect(session.prompt).toBeUndefined();
  expect(player.playing).toBe(true);
});
it("recording-specific progress never overwrites calibration progress", () => {
  const memory = new Map<string, string>(),
    storage = () => ({
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => {
        memory.set(k, v);
      },
    });
  const a = new ProgressStore(storage, "calibration"),
    b = new ProgressStore(storage, "theater.game");
  const content = theaterPracticeContent(source, 6000);
  const snapshot = a.read(content).snapshot;
  a.savePhrase(snapshot, "pass");
  expect(b.read(content).snapshot.savedPhraseIds).toEqual([]);
  b.savePhrase(b.read(content).snapshot, "pass");
  expect(a.read(content).snapshot.savedPhraseIds).toEqual(["pass"]);
});
