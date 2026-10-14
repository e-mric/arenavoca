import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { MomentCards, labCards } from "./cards";
import generated from "./content/alba-generated.json";

describe("reviewed generated Alba batch", () => {
  it("publishes four corrected cards with bounded source evidence and no unsupported claims", () => {
    expect(generated.cards.map((c) => c.id)).toEqual([
      "alba-run",
      "alba-cutback",
      "coutinho-shot",
      "coutinho-goal",
    ]);
    expect(new Set(labCards.map((c) => c.id)).size).toBe(7);
    for (const card of generated.cards) {
      expect(card.evidence.sourceId).toBe(generated.sourceId);
      expect(card.evidence.startSeconds).toBeGreaterThanOrEqual(808);
      expect(card.evidence.endSeconds).toBeLessThanOrEqual(828);
      expect(card.evidence.endSeconds).toBeGreaterThan(
        card.evidence.startSeconds,
      );
      expect(card.evidence.reviewStatus).toContain("Spanish review pending");
      for (const time of card.evidence.frameSeconds) {
        expect(time).toBeGreaterThanOrEqual(card.evidence.startSeconds);
        expect(time).toBeLessThanOrEqual(card.evidence.endSeconds);
      }
      expect(card.spanish).not.toMatch(/pierna izquierda|marcador/);
      expect(card.english).not.toMatch(/left foot|scoreboard/);
    }
    // The contact sheet shows the finish already over at 816s; include its lead-in.
    expect(generated.cards[2].evidence.startSeconds).toBeLessThan(815);
    expect(generated.cards[3].evidence.startSeconds).toBeLessThan(816);
  });
  it("maps the extra shot card into the final story scene and keeps navigation reversible", () => {
    const cards = new MomentCards();
    cards.move(1);
    expect(cards.card.id).toBe("coutinho-shot");
    expect(cards.artworkId).toBe("coutinho-goal");
    cards.flip();
    cards.toggleStory();
    expect(cards.card.id).toBe("coutinho-goal");
    expect(cards.flipped).toBe(false);
    expect(cards.label).toContain("3 of 3");
    expect(cards.spanish).toBe("Su compañero dispara y marca un gol.");
    cards.move(-1);
    expect(cards.card.id).toBe("alba-cutback");
    cards.move(1);
    expect(cards.card.id).toBe("coutinho-goal");
    cards.toggleStory();
    expect(cards.spanish).toBe("El balón entra en la portería.");
    cards.move(-1);
    expect(cards.card.id).toBe("coutinho-shot");
  });
  it("each reachable card and story has text, art and its own matching audio asset", () => {
    const cards = new MomentCards();
    for (const storyMode of [false, true]) {
      cards.storyMode = storyMode;
      cards.index = 0;
      const seen = new Set<string>();
      do {
        seen.add(cards.card.id);
        expect(cards.spanish.length).toBeGreaterThan(10);
        expect(cards.english.length).toBeGreaterThan(10);
        expect(
          existsSync(`public/artwork/match-lab/${cards.artworkId}.png`),
        ).toBe(true);
        expect(existsSync(`public/audio/${cards.audioId}-es.mp3`)).toBe(true);
        const audio = cards.audioId;
        cards.flip();
        expect(cards.audioId).toBe(audio);
        cards.move(1);
      } while (cards.index !== 0 && seen.size < 8);
      expect(seen.size).toBe(storyMode ? 6 : 7);
    }
  });
});
