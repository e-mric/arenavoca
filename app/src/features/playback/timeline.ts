import type { Content, MatchEvent } from "../content/model";
/** Half-open intervals: the video position is the only match clock. */
export function timelineAt(content: Content, position: number, hidden = false) {
  return {
    event: hidden
      ? undefined
      : content.events.find(
          (e) => position >= e.promptStart && position < e.promptEnd,
        ),
    caption:
      content.captions.find((c) => position >= c.start && position < c.end)
        ?.text ?? "",
  };
}
export class Exposure {
  readonly events = new Set<string>();
  readonly phrases = new Set<string>();
  constructor(events: string[] = [], phrases: string[] = []) {
    events.forEach((id) => this.events.add(id));
    phrases.forEach((id) => this.phrases.add(id));
  }
  display(event: MatchEvent): boolean {
    const fresh = !this.events.has(event.id);
    this.events.add(event.id);
    this.phrases.add(event.phraseId);
    return fresh;
  }
  restart() {
    this.events.clear();
    this.phrases.clear();
  }
}
