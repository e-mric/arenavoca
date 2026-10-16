import { expect, it } from "vitest";
import { MomentArrival } from "./arrival";
import { labCards } from "../match-lab/cards";
import { matchSourceId, pregameCards } from "./pregame";
it("delivers the prepared action at its recording endpoint, never at the broadcast clock", () => {
  const feed = new MomentArrival(labCards, matchSourceId);
  expect(feed.observe(459, true)).toBeNull();
  expect(feed.observe(645.9, true)).toBeNull();
  expect(feed.observe(646, true)).toBe("bale-run");
  expect(feed.observe(646.1, true)).toBeNull();
  expect(feed.observe(648, true)).toBe("bale-cross");
  expect(feed.pending).toEqual(["bale-run", "bale-cross"]);
  feed.read("bale-run");
  expect(feed.pending).toEqual(["bale-cross"]);
});
it("does not flood on forward seek or repeat cards after rewinding", () => {
  const feed = new MomentArrival(labCards, matchSourceId);
  feed.observe(100, true);
  expect(feed.observe(1000, true, true)).toBeNull();
  expect(feed.observe(1000, true)).toBeNull();
  expect(feed.available).toHaveLength(7);
  expect(feed.pending).toHaveLength(0);
  feed.observe(640, true, true);
  expect(feed.observe(646, true)).toBeNull();
});
it("unlocks history silently while paused; never reveals future or another match", () => {
  const feed = new MomentArrival(labCards, matchSourceId);
  expect(feed.observe(646, false)).toBeNull();
  expect(feed.available).toEqual(["bale-run"]);
  expect(feed.next("bale-run", 1)).toBe("bale-run");
  expect(feed.observe(NaN, true)).toBeNull();
  expect(
    new MomentArrival(labCards, "another-match").observe(646, true),
  ).toBeNull();
});
it("keeps pregame editorial context sourced, historical and outside the action timeline", () => {
  expect(pregameCards).toHaveLength(5);
  for (const card of pregameCards) {
    expect(card.context?.url).toMatch(/^https:\/\//);
    expect(card.context?.asOf).toBe("2018-10-28");
    expect(card.evidence.reviewStatus).toContain(
      "fluent Spanish review pending",
    );
    expect(labCards.some((c) => c.id === card.id)).toBe(false);
    expect(card.spanish).not.toMatch(/cinco a uno|5[–-]1|hat.trick/i);
  }
});
