import { Session } from "./session";
import { PassTrace } from "../learning/tracing";
import { Pronunciation, commentaryVolume } from "../audio/pronunciation";
import type { MatchPlayer } from "../playback/player";
/** Both the DOM preview and spatial controls issue commands through this coordinator. */
export class Experience {
  trace: PassTrace;
  replaying = false;
  diagramProgress = 0;
  trackLost = false;
  onChange = () => {};
  private listenRequest = 0;
  constructor(
    readonly session: Session,
    readonly audio: Pronunciation,
    readonly player: MatchPlayer,
  ) {
    this.trace = new PassTrace(session.content.diagrams[0].route);
    session.onChange = () => {
      this.syncAudio();
      this.onChange();
    };
    session.onStopAudio = () => this.stopAudio();
    audio.onChange = () => {
      this.syncAudio();
      this.onChange();
    };
  }
  stopAudio() {
    this.listenRequest++;
    this.audio.stop();
  }
  syncAudio() {
    this.player.video.volume = commentaryVolume(
      this.session.snapshot.preferences.muted,
      this.audio.speaking,
    );
  }
  async listen() {
    const phrase = this.session.phrase;
    if (!phrase) return;
    const request = ++this.listenRequest;
    const mode = this.session.mode;
    try {
      if (!this.audio.has(phrase.id))
        await this.audio.preload(phrase.id, phrase.pronunciation);
      if (
        request !== this.listenRequest ||
        this.session.phrase?.id !== phrase.id ||
        this.session.mode !== mode
      )
        return;
      await this.audio.listen(phrase.id);
      this.session.message = "";
    } catch (e) {
      this.session.message =
        e instanceof Error
          ? e.message
          : "Pronunciation could not play. Please retry.";
    }
    this.onChange();
  }
  explore() {
    this.trace.reset();
    this.diagramProgress = 0;
    this.replaying = false;
    this.trackLost = false;
    this.session.explore();
  }
  startTrace(hand: "left" | "right" = "right") {
    if (this.session.mode !== "Exploring") return;
    this.replaying = false;
    this.diagramProgress = 0;
    this.trackLost = false;
    this.trace.start(hand);
    this.onChange();
  }
  replay() {
    if (this.session.mode !== "Exploring") return;
    this.trace.reset();
    this.diagramProgress = 0;
    this.replaying = true;
    this.trackLost = false;
    this.onChange();
  }
  async back() {
    this.trace.reset();
    this.replaying = false;
    await this.session.back();
  }
  frame(delta: number) {
    if (this.session.mode === "Watching") this.session.tick();
    if (this.session.mode === "Exploring") {
      if (this.replaying) {
        this.diagramProgress = Math.min(
          1,
          this.diagramProgress +
            delta / this.session.content.diagrams[0].duration,
        );
        if (this.diagramProgress === 1) this.replaying = false;
      } else if (this.trace.armed || this.trace.progress > 0)
        this.diagramProgress = this.trace.progress;
    } else {
      this.replaying = false;
      this.trace.armed = false;
    }
    this.onChange();
  }
}
