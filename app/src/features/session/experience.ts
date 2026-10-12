import type { Coach } from "../coach/coach";
import { Session } from "./session";
import { PassTrace } from "../learning/tracing";
import { Pronunciation, commentaryVolume } from "../audio/pronunciation";
import type { MatchPlayer } from "../playback/player";
import type { Commentary, CommentaryLanguage } from "../audio/commentary";
/** Both the DOM preview and spatial controls issue commands through this coordinator. */
export class Experience {
  coach?: Coach;
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
    readonly commentary?: Commentary,
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
    if (commentary)
      commentary.onError = () => {
        session.message =
          "Spanish commentary is unavailable. English continues; you can retry after reloading.";
        session.setPreference("commentaryLanguage", "english");
      };
  }
  attachCoach(coach: Coach) {
    this.coach = coach;
    coach.beforeStart = () => {
      this.listenRequest++;
      this.audio.stop();
    };
    coach.onChange = () => {
      this.syncAudio();
      this.onChange();
    };
  }
  openCoach() {
    const phrase = this.session.phrase ?? this.session.content.phrases[0];
    const { sport, team } = this.session.snapshot.preferences;
    this.coach?.show({
      sport,
      team,
      phrase: phrase.spanish,
      translation: phrase.english,
    });
  }
  stopAudio() {
    this.coach?.stop();
    this.listenRequest++;
    this.audio.stop();
  }
  syncAudio() {
    const volume = commentaryVolume(
      this.session.snapshot.preferences.muted,
      this.audio.speaking || !!this.coach?.ducking,
    );
    const spanish =
      !this.session.content.manualPractice &&
      this.session.snapshot.preferences.commentaryLanguage === "spanish" &&
      this.commentary?.ready;
    this.player.video.volume = spanish ? 0 : volume;
    this.commentary?.sync(
      this.player.video,
      spanish ? "spanish" : "english",
      volume,
    );
  }
  setCommentaryLanguage(language: CommentaryLanguage) {
    if (language === "spanish" && this.session.content.manualPractice) {
      this.session.message =
        "This video keeps its source commentary. Use Listen for Spanish pronunciation.";
      this.onChange();
      return;
    }
    if (language === "spanish" && !this.commentary?.ready) {
      this.session.message =
        "Spanish commentary is unavailable. English is still available.";
      this.onChange();
      return;
    }
    this.session.message = "";
    this.session.setPreference("commentaryLanguage", language);
  }
  async listen() {
    this.coach?.stop();
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
    if (this.session.matchActive) this.session.tick();
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
