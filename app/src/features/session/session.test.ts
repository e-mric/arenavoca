import { it, expect, vi } from "vitest";
import raw from "../../../public/content/match.json";
import { validateContent } from "../content/model";
import { Session } from "./session";
import type { Playback } from "../playback/player";
import { ProgressStore, PROGRESS_KEY, emptySnapshot } from "../progress/store";
const content = validateContent(raw);
function setup() {
  const data = new Map<string, string>();
  let writesFail = false;
  const player = {
    position: 0,
    playing: false as boolean,
    play: vi.fn(async () => {
      player.playing = true;
    }),
    pause: vi.fn(() => {
      player.playing = false;
    }),
    restart: vi.fn(() => {
      player.playing = false;
      player.position = 0;
    }),
    restore: (p: number) => {
      player.position = p;
    },
  } satisfies Playback;
  const store = new ProgressStore(() => ({
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      if (writesFail) throw new Error("quota");
      data.set(k, v);
    },
  }));
  const s = new Session(content, player, store);
  s.ready();
  return {
    s,
    player,
    data,
    store,
    fail: () => {
      writesFail = true;
    },
  };
}
async function prompt() {
  const result = setup();
  await result.s.start();
  result.player.position = 13;
  result.s.tick();
  return result;
}
it("can finish while ignoring every prompt", async () => {
  const { s, player } = setup();
  await s.start();
  player.position = 30;
  s.tick();
  expect(s.mode).toBe("Completed");
  expect(s.snapshot.savedPhraseIds).toEqual([]);
});
it("Explore and closing leave playback running at its advancing position", async () => {
  const { s, player } = await prompt();
  s.explore();
  expect(s.mode).toBe("Exploring");
  expect(player.playing).toBe(true);
  player.position = 21;
  s.tick();
  expect(s.phrase?.id).toBe("pass");
  expect(s.snapshot.resumableSession?.position).toBe(21);
  await s.back();
  expect(player.position).toBe(21);
  expect(player.playing).toBe(true);
});
it("previously paused match stays paused after exploration", async () => {
  const { s, player } = await prompt();
  await s.togglePlayback();
  s.explore();
  await s.back();
  expect(player.playing).toBe(false);
  expect(player.position).toBe(13);
});
it("restart resets current activity but preserves saved phrases", async () => {
  const { s, player } = await prompt();
  s.save();
  await s.restart();
  expect(s.exposure.events.size).toBe(0);
  expect(s.snapshot.savedPhraseIds).toEqual(["pass"]);
  expect(player.position).toBe(0);
});
it("suspension requires explicit resume and stops audio", async () => {
  const { s, player } = await prompt();
  s.onStopAudio = vi.fn();
  s.explore();
  s.suspend();
  expect(s.mode).toBe("Suspended");
  expect(player.playing).toBe(false);
  expect(s.onStopAudio).toHaveBeenCalled();
  s.tick();
  expect(s.mode).toBe("Suspended");
  await s.resume();
  expect(player.playing).toBe(true);
  expect(player.position).toBe(13);
});
it("failed saves remain unsaved", async () => {
  const { s, fail } = await prompt();
  fail();
  s.save();
  expect(s.snapshot.savedPhraseIds).toEqual([]);
  expect(s.message).toContain("Could not save");
});
it("card expiration and hiding stop pronunciation without blocking viewing", async () => {
  const { s, player } = await prompt();
  s.onStopAudio = vi.fn();
  player.position = 20;
  s.tick();
  expect(s.selected).toBeUndefined();
  expect(s.onStopAudio).toHaveBeenCalled();
  player.position = 13;
  s.tick();
  s.setPreference("promptsHidden", true);
  expect(s.selected).toBeUndefined();
  expect(player.playing).toBe(true);
  expect(s.exposure.phrases.has("pass")).toBe(true);
});
it("resume restores playback position and existing exposures without backlog", async () => {
  const { s, player, data } = setup();
  const snapshot = emptySnapshot(content.version);
  snapshot.resumableSession = {
    position: 22,
    seenEventIds: ["pass-01"],
    seenPhraseIds: ["pass"],
    completed: false,
  };
  data.set(PROGRESS_KEY, JSON.stringify(snapshot));
  s.ready();
  await s.start(true);
  s.tick();
  expect(player.position).toBe(22);
  expect(s.selected).toBeUndefined();
  expect(s.exposure.phrases.size).toBe(1);
});
it("opening a seen phrase library leaves the match running", async () => {
  const { s, player } = await prompt();
  s.library();
  expect(player.playing).toBe(true);
  expect(s.phrase?.id).toBe("pass");
  await s.back();
  expect(player.playing).toBe(true);
});
it("reports autoplay failures and allows a retry", async () => {
  const { s, player } = setup();
  player.play.mockRejectedValueOnce(new Error("blocked"));
  await s.start();
  expect(s.message).toContain("could not start");
  expect(player.playing).toBe(false);
  await s.togglePlayback();
  expect(player.playing).toBe(true);
});
it("pending play can finish after Explore without an automatic pause", async () => {
  const { s, player } = await prompt();
  player.playing = false;
  let resolve!: () => void;
  player.play.mockImplementationOnce(
    () =>
      new Promise<void>((r) => {
        resolve = () => {
          player.playing = true;
          r();
        };
      }),
  );
  const pending = s.play();
  s.explore();
  resolve();
  await pending;
  expect(s.mode).toBe("Exploring");
  expect(player.playing).toBe(true);
});
it("explicit pause during Explore wins over a late play completion", async () => {
  const { s, player } = await prompt();
  player.playing = false;
  let resolve!: () => void;
  player.play.mockImplementationOnce(
    () =>
      new Promise<void>((r) => {
        resolve = () => {
          player.playing = true;
          r();
        };
      }),
  );
  const pending = s.play();
  s.explore();
  await s.togglePlayback();
  resolve();
  await pending;
  expect(player.playing).toBe(false);
  await s.back();
  expect(player.playing).toBe(false);
});
it("manual pause and Play remain available while exploring", async () => {
  const { s, player } = await prompt();
  s.explore();
  await s.togglePlayback();
  expect(player.playing).toBe(false);
  await s.togglePlayback();
  expect(player.playing).toBe(true);
  await s.back();
  expect(player.playing).toBe(true);
});
it.each(["explore", "library"] as const)(
  "full time preserves the open %s until closed",
  async (open) => {
    const { s, player } = await prompt();
    s[open]();
    const mode = s.mode;
    player.position = 30;
    s.tick();
    expect(s.mode).toBe(mode);
    expect(s.phrase?.id).toBe("pass");
    expect(s.snapshot.resumableSession?.completed).toBe(true);
    const pauseCount = player.pause.mock.calls.length;
    s.tick();
    expect(player.pause).toHaveBeenCalledTimes(pauseCount);
    await s.back();
    expect(s.mode).toBe("Completed");
    expect(player.playing).toBe(false);
  },
);
it("unknown or unseen events cannot open exploration", () => {
  const { s } = setup();
  s.explore(content.events[0]);
  expect(s.mode).toBe("Onboarding");
});
it("persists pre-match team choice without manufacturing a resumable match", () => {
  const { s, data } = setup();
  s.setPreference("team", "blue");
  s.setPreference("karaokeEnabled", true);
  const saved = JSON.parse(data.get(PROGRESS_KEY)!);
  expect(saved.preferences.team).toBe("blue");
  expect(saved.preferences.karaokeEnabled).toBe(true);
  expect(saved.resumableSession).toBeNull();
});
it("changing sport resets the team and prevents cross-sport themes", () => {
  const { s } = setup();
  s.setPreference("team", "barcelona");
  s.setSport("f1");
  expect(s.snapshot.preferences.team).toBe("neutral");
  s.setPreference("team", "barcelona");
  expect(s.snapshot.preferences.team).toBe("neutral");
  s.setPreference("team", "ferrari");
  expect(s.snapshot.preferences.team).toBe("ferrari");
});
it("Spanish captions follow the same video clock without affecting playback", async () => {
  const { s, player } = setup();
  await s.start();
  player.position = 7;
  expect(s.caption).toContain("lovely pass");
  s.setPreference("commentaryLanguage", "spanish");
  expect(s.caption).toContain("Un buen pase");
  expect(player.playing).toBe(true);
  expect(player.position).toBe(7);
});

it("explicit skip preserves playing or paused intent and rejects invalid positions", async () => {
  const { s, player } = setup();
  await s.start();
  await s.seekTo(15);
  expect(player.position).toBe(15);
  expect(player.playing).toBe(true);
  await s.togglePlayback();
  await s.seekTo(20);
  expect(player.position).toBe(20);
  expect(player.playing).toBe(false);
  await s.seekTo(NaN);
  expect(player.position).toBe(20);
});
