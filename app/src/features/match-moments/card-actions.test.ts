import { expect, it, vi } from "vitest";
import { momentActions } from "./card-actions";
import { MomentCards } from "../match-lab/cards";
import type { Experience } from "../session/experience";
import {
  MOMENT_SAVE_PREFIX,
  readLabSave,
  saveLabPhrase,
} from "../match-lab/progress";
import { pregameCards } from "./pregame";
it("targets the pinned moment and prevents unavailable actions on pregame or closed cards", () => {
  const cards = new MomentCards();
  cards.addContext(pregameCards);
  const e = {
    lab: { open: true, cards },
    replayLab: vi.fn(),
    listenLab: vi.fn(),
    saveLab: vi.fn(),
  };
  const a = momentActions(e as unknown as Experience);
  a.replay();
  a.listen();
  a.save();
  expect(e.replayLab).toHaveBeenCalledTimes(1);
  expect(e.listenLab).toHaveBeenCalledTimes(1);
  expect(e.saveLab).toHaveBeenCalledTimes(1);
  cards.select(pregameCards[0].id);
  a.replay();
  a.listen();
  a.save();
  expect(e.replayLab).toHaveBeenCalledTimes(1);
  expect(e.listenLab).toHaveBeenCalledTimes(1);
  expect(e.saveLab).toHaveBeenCalledTimes(2);
  e.lab.open = false;
  a.replay();
  a.listen();
  a.save();
  expect(e.saveLab).toHaveBeenCalledTimes(2);
});
it("persists the whole moment and time range, compatible with local recap saves", () => {
  const values = new Map<string, string>();
  const storage = {
    setItem: (k: string, v: string) => values.set(k, v),
    getItem: (k: string) => values.get(k) ?? null,
  };
  const card = new MomentCards().card;
  expect(saveLabPhrase(storage, card.id, card)).toBe(true);
  expect(readLabSave(storage, card.id)).toBe(true);
  const stored = JSON.parse(storage.getItem(MOMENT_SAVE_PREFIX + card.id)!);
  expect(stored.card).toEqual(card);
  expect(stored.sourceId).toBe(card.evidence.sourceId);
  expect(stored.replayPath).toContain(card.id);
  expect(stored.sync).toBe("local");
  saveLabPhrase(storage, card.id, card);
  expect(values.size).toBe(2);
});
it("does not report success when saving the moment fails", () => {
  const storage = {
    setItem: vi.fn(() => {
      throw new Error("quota");
    }),
  };
  const card = new MomentCards().card;
  expect(saveLabPhrase(storage, card.id, card)).toBe(false);
  expect(storage.setItem).toHaveBeenCalledTimes(1);
});
