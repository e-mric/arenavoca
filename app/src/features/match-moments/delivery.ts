import { labCards } from "../match-lab/cards";
import type { Experience } from "../session/experience";
import { MomentArrival } from "./arrival";
import { kickoffSeconds, matchSourceId, pregameCards } from "./pregame";
/** UI coordinator: observes playback; opening or browsing never commands it. */
export class MomentDelivery {
  readonly arrivals = new MomentArrival(labCards, matchSourceId);
  private welcomed = false;
  noticeRevision = 0;
  noticeTarget: string | undefined;
  constructor(private readonly e: Experience) {
    e.lab.cards.addContext(pregameCards);
  }
  update() {
    const e = this.e;
    if (!e.labAvailable || !e.session.matchActive) return;
    const next = this.arrivals.observe(
      e.player.position,
      e.player.playing,
      e.player.video.seeking,
    );
    if (!this.welcomed) {
      this.welcomed = true;
      if (e.player.position < kickoffSeconds && !e.lab.open)
        this.announce(pregameCards[0].id);
    }
    if (next) this.announce(next);
  }
  private announce(id: string) {
    this.noticeTarget = id;
    this.noticeRevision++;
  }
  open(id?: string) {
    const target = id ?? this.arrivals.pending[0] ?? this.arrivals.newest;
    if (!target || !this.e.labAvailable || !this.e.session.matchActive) return;
    if (
      !this.arrivals.available.includes(target) &&
      !pregameCards.some((c) => c.id === target)
    )
      return;
    this.arrivals.read(target);
    this.e.labReplay?.stop();
    this.e.lab.cards.select(target);
    this.e.lab.browse();
    this.e.openLab();
  }
  pregame() {
    this.open(pregameCards[0].id);
  }
  move(direction: -1 | 1) {
    const current = this.e.lab.cards.card;
    if (current.context) {
      const index = pregameCards.findIndex((c) => c.id === current.id);
      this.open(
        pregameCards[
          (index + direction + pregameCards.length) % pregameCards.length
        ].id,
      );
    } else this.open(this.arrivals.next(current.id, direction));
  }
  get storyAvailable() {
    const cards = this.e.lab.cards;
    return (
      !cards.card.context &&
      cards.story.cardIds.every((id) => this.arrivals.available.includes(id))
    );
  }
  get nextStart() {
    return labCards
      .filter((c) => c.evidence.endSeconds > this.e.player.position)
      .sort((a, b) => a.evidence.endSeconds - b.evidence.endSeconds)[0]
      ?.evidence.startSeconds;
  }
}
