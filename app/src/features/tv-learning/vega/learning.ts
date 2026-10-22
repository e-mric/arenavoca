export type Moment = {
  id: string;
  title: string;
  spanish: string;
  english: string;
  end: number;
  artwork: string;
};
export type Sequence = {
  id: string;
  title: string;
  details: string;
  duration: number;
  moments: Moment[];
};

/** Only observed video time unlocks cards. This model has no playback commands. */
export class Learning {
  position = 0;
  selected: Moment | null = null;
  translated = false;
  constructor(readonly sequence: Sequence) {}
  get available() {
    return this.sequence.moments.filter((m) => m.end <= this.position);
  }
  observe(seconds: number) {
    if (Number.isFinite(seconds))
      this.position = Math.max(0, Math.min(seconds, this.sequence.duration));
  }
  open(id: string, saved: string[] = []) {
    const moment = this.sequence.moments.find(
      (m) => m.id === id && (m.end <= this.position || saved.includes(id)),
    );
    if (!moment) return false;
    this.selected = moment;
    this.translated = false;
    return true;
  }
  flip() {
    if (this.selected) this.translated = !this.translated;
  }
  close() {
    this.selected = null;
    this.translated = false;
  }
}

/** Generic distractors cannot reveal an upcoming event from this match. */
export function recallChoices(card: Moment): string[] {
  const generic = ['The ball goes out of play.', 'The referee stops the game.'];
  return [generic[0], card.english, generic[1]];
}
