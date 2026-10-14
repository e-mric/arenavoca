import type { MomentBatch } from "../match-recognition/stream";
import pack from "../stories/content/barca-2018-opening.json";
import generated from "./content/alba-generated.json";

type Card = (typeof pack.cards)[number] & {
  artworkCardId?: string;
  storyCardId?: string;
  draft?: boolean;
  replayPath?: string;
};
// Only this reviewed batch is published. Raw model responses stay private.
export const labCards: Card[] = [
  ...pack.cards.filter(
    (card) => !generated.cards.some((c) => c.id === card.id),
  ),
  ...generated.cards,
];
const preparedStories = [pack.stories[0], ...generated.stories];
type Story = Pick<
  (typeof preparedStories)[number],
  "id" | "title" | "cardIds" | "sceneSpanish" | "sceneEnglish"
>;
/** Playback time never changes the selected card or its story scene. */
export class MomentCards {
  private readonly items = [...labCards];
  private readonly stories: Story[] = [...preparedStories];
  get draftCount() {
    return this.items.length - labCards.length;
  }
  get artworkPath() {
    return this.card.draft
      ? "branding/favicon.png"
      : `artwork/match-lab/${this.artworkId}.png`;
  }
  get replayPath() {
    return this.card.replayPath;
  }
  showDrafts() {
    if (!this.draftCount) return;
    this.index = labCards.length;
    this.storyMode = this.flipped = false;
  }
  append(batch: MomentBatch) {
    const existing = new Set(this.items.map((card) => card.id));
    for (const moment of batch.moments) {
      if (existing.has(moment.id)) continue;
      existing.add(moment.id);
      this.items.push({
        id: moment.id,
        title: `Draft / ${moment.action}`,
        spanish: moment.spanish,
        english: moment.english,
        hint: "AI draft / check the replay. Factual and Spanish review pending.",
        artwork: "draft",
        artworkCardId: "draft",
        draft: true,
        replayPath: moment.replayPath,
        evidence: {
          sourceId: batch.window.sourceId,
          startSeconds: moment.startSeconds,
          endSeconds: moment.endSeconds,
          commentarySummary: moment.commentaryEvidence,
          visualObservation: moment.visualEvidence,
          frameSeconds: [],
          matchClock: `recording ${moment.startSeconds.toFixed(1)}-${moment.endSeconds.toFixed(1)}s`,
          commentaryStartSeconds: batch.window.startSeconds,
          commentaryEndSeconds: batch.window.endSeconds,
          reviewStatus: "Unreviewed AI draft",
        },
      });
    }
    const scenes = batch.story;
    if (scenes.length && scenes.every((scene) => existing.has(scene.eventId))) {
      const id = `draft-story-${scenes.map((s) => s.eventId).join("-")}`;
      if (!this.stories.some((story) => story.id === id))
        this.stories.push({
          id,
          title: "AI draft story",
          cardIds: scenes.map((s) => s.eventId),
          sceneSpanish: scenes.map((s) => s.spanish),
          sceneEnglish: scenes.map((s) => s.english),
        });
    }
    for (const moment of batch.moments) {
      if (!this.stories.some((story) => story.cardIds.includes(moment.id)))
        this.stories.push({
          id: `draft-single-${moment.id}`,
          title: "One observed moment / draft",
          cardIds: [moment.id],
          sceneSpanish: [moment.spanish],
          sceneEnglish: [moment.english],
        });
    }
    // Appending never changes index, reveal, physical pose or selected story.
  }
  index = labCards.findIndex((card) => card.id === "alba-cutback");
  storyMode = false;
  flipped = false;
  get count() {
    return this.items.length;
  }
  get card() {
    return this.items[this.index];
  }
  get artworkId() {
    return this.card.artworkCardId ?? this.card.id;
  }
  get generated() {
    return generated.cards.some((card) => card.id === this.card.id);
  }
  get story() {
    return this.stories.find((s) =>
      s.cardIds.includes(this.card.storyCardId ?? this.card.id),
    )!;
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
  get audioId() {
    if (this.card.draft) return null;
    return this.storyMode
      ? `lab-story-${this.story.id}-${this.storyIndex + 1}`
      : this.generated
        ? `lab-generated-${this.card.id}`
        : this.card.id;
  }
  flip() {
    this.flipped = !this.flipped;
  }
  move(direction: -1 | 1) {
    if (this.storyMode) {
      const storyCardIds = [
        ...new Set(this.stories.flatMap((story) => story.cardIds)),
      ];
      const position = storyCardIds.indexOf(this.card.id);
      const id =
        storyCardIds[
          (position + direction + storyCardIds.length) % storyCardIds.length
        ];
      this.index = this.items.findIndex((card) => card.id === id);
    } else {
      this.index =
        (this.index + direction + this.items.length) % this.items.length;
    }
    this.flipped = false;
  }
  toggleStory() {
    this.storyMode = !this.storyMode;
    // The shot and goal share the final story scene. Select its matching replay.
    if (this.storyMode && this.card.storyCardId) {
      this.index = this.items.findIndex(
        (card) => card.id === this.card.storyCardId,
      );
    }
    this.flipped = false;
  }
  get label() {
    return this.storyMode
      ? `${this.story.title} / ${this.storyIndex + 1} of ${this.story.cardIds.length}`
      : `Moment ${this.index + 1} of ${this.count} / ${this.card.title}`;
  }
}
