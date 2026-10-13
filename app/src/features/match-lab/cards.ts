import pack from "../stories/content/barca-2018-opening.json";
/** Prepared source-backed cards. Playback time never changes the selected card. */
export class MomentCards {
  index = 4;
  storyMode = false;
  flipped = false;
  get card() {
    return pack.cards[this.index];
  }
  get story() {
    return pack.stories.find((s) => s.cardIds.includes(this.card.id))!;
  }
  get storyIndex() {
    return this.story.cardIds.indexOf(this.card.id);
  }
  get spanish() {
    return this.storyMode
      ? this.story.sceneSpanish[this.storyIndex]
      : this.card.spanish;
  }
  get english() {
    return this.storyMode
      ? this.story.sceneEnglish[this.storyIndex]
      : this.card.english;
  }
  flip() {
    this.flipped = !this.flipped;
  }
  move(direction: -1 | 1) {
    this.index =
      (this.index + direction + pack.cards.length) % pack.cards.length;
    this.flipped = false;
  }
  toggleStory() {
    this.storyMode = !this.storyMode;
    this.flipped = false;
  }
  get label() {
    return this.storyMode
      ? `${this.story.title} / ${this.storyIndex + 1} of 3`
      : `Moment ${this.index + 1} of ${pack.cards.length} / ${this.card.title}`;
  }
}
