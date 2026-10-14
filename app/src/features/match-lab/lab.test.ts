import { describe, expect, it } from "vitest";
import { arrangements, MatchLab } from "./lab";
import { MomentCards } from "./cards";
import { readLabSave, saveLabPhrase } from "./progress";
function settle(lab: MatchLab) {
  for (let i = 0; i < 10; i++) lab.frame(0.1);
}
describe("cutback practice", () => {
  it("requires selecting the ball; feedback precedes a changed arrangement", () => {
    const lab = new MatchLab();
    lab.show();
    lab.begin();
    lab.choose(0);
    expect(lab.phase).toBe("choose");
    lab.pickBall();
    lab.choose(1);
    expect(lab.correct).toBe(false);
    expect(lab.message).toContain("away from the goal");
    lab.next();
    expect(lab.round).toBe(0);
    lab.begin();
    lab.pickBall();
    lab.choose(0);
    lab.next();
    expect(lab.round).toBe(0);
    settle(lab);
    lab.next();
    expect(lab.round).toBe(1);
    expect(lab.translation).toBe(false);
    expect(lab.armed).toBe(false);
    lab.pickBall();
    lab.choose(0);
    expect(lab.correct).toBe(false);
    lab.begin();
    lab.pickBall();
    lab.choose(1);
    settle(lab);
    lab.next();
    expect(lab.phase).toBe("complete");
  });
  it("the correct teammate is backwards relative to attack, not a fixed screen position", () => {
    for (const a of arrangements) {
      expect((a.players[a.answer][0] - a.ball[0]) * a.attack).toBeLessThan(0);
      a.players.forEach((p, i) => {
        if (i !== a.answer)
          expect((p[0] - a.ball[0]) * a.attack).toBeGreaterThanOrEqual(0);
      });
    }
  });
  it("a demonstration never counts as a completed answer", () => {
    const lab = new MatchLab();
    lab.show();
    lab.demonstrate();
    settle(lab);
    lab.next();
    expect(lab.round).toBe(0);
    expect(lab.phase).toBe("feedback");
    lab.begin();
    expect(lab.selected).toBeNull();
    expect(lab.translation).toBe(false);
  });
  it("close disarms input and prevents hidden answers; retries clear previous choices", () => {
    const lab = new MatchLab();
    lab.show();
    lab.begin();
    lab.pickBall();
    lab.close();
    lab.choose(0);
    expect(lab.selected).toBeNull();
    lab.show();
    expect(lab.armed).toBe(false);
    lab.pickBall();
    lab.choose(0);
    lab.begin();
    expect(lab.motion).toBe(0);
    expect(lab.selected).toBeNull();
  });
  it("rejects invalid recipients and non-finite animation ticks", () => {
    const lab = new MatchLab();
    lab.show();
    lab.begin();
    lab.pickBall();
    for (const value of [-1, 3, NaN, 0.4]) lab.choose(value);
    expect(lab.phase).toBe("choose");
    lab.choose(0);
    lab.frame(NaN);
    lab.frame(-1);
    expect(lab.motion).toBe(0);
  });
});
describe("floating match cards", () => {
  it("opens on the cutback, flips translation, resets the reveal on every new card", () => {
    const cards = new MomentCards();
    expect(cards.card.id).toBe("alba-cutback");
    expect(cards.flipped).toBe(false);
    cards.flip();
    expect(cards.flipped).toBe(true);
    expect(cards.english).toContain("back");
    cards.move(1);
    expect(cards.card.id).toBe("coutinho-shot");
    expect(cards.flipped).toBe(false);
    cards.move(1);
    expect(cards.card.id).toBe("coutinho-goal");
    cards.move(1);
    expect(cards.card.id).toBe("bale-run");
    cards.move(-1);
    expect(cards.card.id).toBe("coutinho-goal");
  });
  it("a story uses the matching scene and evidence as navigation crosses story boundaries", () => {
    const cards = new MomentCards();
    cards.toggleStory();
    expect(cards.storyIndex).toBe(1);
    expect(cards.spanish).toContain("pase raso hacia atrás");
    cards.move(1);
    expect(cards.storyIndex).toBe(2);
    expect(cards.english).toContain("shoots and scores a goal");
    cards.move(1);
    expect(cards.story.id).not.toBe("alba-generated-story");
    expect(cards.storyIndex).toBe(0);
    expect(cards.card.evidence.startSeconds).toBe(640);
  });
  it("saves are local and scoped to the actual selected card", () => {
    const map = new Map<string, string>();
    const storage = {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, val: string) => {
        map.set(key, val);
      },
    };
    expect(saveLabPhrase(storage, "alba-cutback")).toBe(true);
    expect(readLabSave(storage, "alba-cutback")).toBe(true);
    expect(readLabSave(storage, "bale-run")).toBe(false);
    expect(
      saveLabPhrase({
        setItem: () => {
          throw new Error();
        },
      }),
    ).toBe(false);
  });
});
