import { afterEach, expect, it, vi } from "vitest";
import raw from "../../../public/content/match.json";
import { validateContent } from "../content/model";
import { Experience } from "../session/experience";
import { Session } from "../session/session";
import { ProgressStore } from "../progress/store";
import type { MatchPlayer } from "../playback/player";
import type { Pronunciation } from "../audio/pronunciation";
import { MomentDelivery } from "./delivery";
afterEach(() => vi.unstubAllGlobals());
function setup() {
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => {} });
  const content = validateContent(structuredClone(raw));
  content.version = "theater-barca-2018-full-football";
  const player = {
    position: 0,
    playing: true,
    video: { volume: 1, seeking: false },
    play: vi.fn(),
    pause: vi.fn(),
    restart: vi.fn(),
    restore: vi.fn(),
  };
  const session = new Session(
    content,
    player as unknown as MatchPlayer,
    new ProgressStore(() => localStorage),
  );
  session.mode = "Watching";
  const audio = { speaking: false, stop: vi.fn() };
  const e = new Experience(
    session,
    audio as unknown as Pronunciation,
    player as unknown as MatchPlayer,
  );
  return { e, player, feed: new MomentDelivery(e) };
}
it("offers pregame context, pins it across arrivals and opens queued cards without touching playback", () => {
  const { e, player, feed } = setup();
  feed.update();
  expect(e.lab.open).toBe(false);
  expect(feed.noticeTarget).toBe("pregame-barca-form");
  feed.pregame();
  expect(e.lab.cards.card.id).toBe("pregame-barca-form");
  e.lab.cards.flip();
  player.position = 646;
  feed.update();
  expect(e.lab.cards.card.id).toBe("pregame-barca-form");
  expect(e.lab.cards.flipped).toBe(true);
  expect(feed.arrivals.pending).toEqual(["bale-run"]);
  feed.open();
  expect(e.lab.cards.card.id).toBe("bale-run");
  expect(feed.storyAvailable).toBe(false);
  feed.move(1);
  expect(e.lab.cards.card.id).toBe("bale-run");
  e.closeLab();
  feed.update();
  expect(e.lab.open).toBe(false);
  player.position = 648;
  feed.update();
  expect(e.lab.open).toBe(false);
  expect(feed.noticeTarget).toBe("bale-cross");
  feed.open(feed.noticeTarget);
  expect(e.lab.cards.card.id).toBe("bale-cross");
  for (const fn of [player.play, player.pause, player.restart, player.restore])
    expect(fn).not.toHaveBeenCalled();
});
it("does not substitute Alba or pregame context for an unrelated recording", () => {
  const { e, feed } = setup();
  e.session.content.version = "prototype-pass-v1";
  feed.update();
  feed.pregame();
  feed.open("alba-cutback");
  expect(e.lab.open).toBe(false);
});
it("preserves a selected action and its story across later moments while explicitly paused", () => {
  const { e, player, feed } = setup();
  player.position = 700;
  player.playing = false;
  feed.update();
  feed.open("bale-run");
  expect(feed.storyAvailable).toBe(true);
  e.changeLabCard("story");
  e.changeLabCard("flip");
  player.position = 820;
  feed.update();
  expect(e.lab.cards.card.id).toBe("bale-run");
  expect(e.lab.cards.storyMode).toBe(true);
  expect(e.lab.cards.flipped).toBe(true);
  expect(player.play).not.toHaveBeenCalled();
  expect(player.restore).not.toHaveBeenCalled();
});

it("mutes only match audio while pronunciation stays available and playback is untouched", () => {
  const { e, player } = setup();
  e.session.setPreference("muted", true);
  e.syncAudio();
  expect(player.video.volume).toBe(0);
  expect(e.audio.stop).not.toHaveBeenCalled();
  e.session.setPreference("muted", false);
  e.syncAudio();
  expect(player.video.volume).toBeGreaterThan(0);
  for (const fn of [player.play, player.pause, player.restart, player.restore])
    expect(fn).not.toHaveBeenCalled();
});
