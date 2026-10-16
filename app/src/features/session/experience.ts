import { RecordedStream } from "../match-recognition/stream";
import { localRecognition } from "../match-recognition/client";
import { MatchLab, cutback } from "../match-lab/lab";
import { LabReplay } from "../match-lab/replay";
import { readLabSave, saveLabPhrase } from "../match-lab/progress";
import type { Coach } from "../coach/coach";
import { Session } from "./session";
import { PassTrace } from "../learning/tracing";
import { Pronunciation, commentaryVolume } from "../audio/pronunciation";
import type { MatchPlayer } from "../playback/player";
import type { Commentary, CommentaryLanguage } from "../audio/commentary";
/** Both the DOM preview and spatial controls issue commands through this coordinator. */
export class Experience {
  coach?: Coach;
  readonly lab = new MatchLab();
  labReplay?: LabReplay;
  readonly recognition = new RecordedStream(localRecognition, (batch) =>
    this.lab.cards.append(batch),
  );
  private readonly recognitionRequested =
    typeof location !== "undefined" &&
    new URLSearchParams(location.search).has("recognition");
  get recognitionEnabled() {
    return this.recognitionRequested && this.labAvailable;
  }
  toggleRecognition() {
    if (this.recognition.active) this.recognition.stop();
    else if (this.recognitionEnabled && this.session.matchActive)
      void this.recognition.start(this.player.position);
  }
  showRecognitionDrafts() {
    if (!this.lab.open) return;
    this.changeLabCard("browse");
    this.lab.cards.showDrafts();
    this.lab.saved = readLabSave(localStorage, this.lab.cards.card.id);
  }
  private labListening = false;
  get labAvailable() {
    return this.session.content.version === "theater-barca-2018-full-football";
  }
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
    this.lab.onClose = () => {
      this.labReplay?.stop();
      if (this.labListening) {
        this.listenRequest++;
        this.audio.stop();
        this.labListening = false;
      }
    };
    this.trace = new PassTrace(session.content.diagrams[0].route);
    session.onChange = () => {
      if (this.recognition.active && !session.matchActive)
        this.recognition.stop("Analysis stopped on exit");
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
  openLab() {
    if (!this.labAvailable || !this.session.matchActive) return;
    this.stopAudio();
    this.coach?.close();
    this.trace.reset();
    this.replaying = false;
    this.lab.saved = readLabSave(localStorage, this.lab.cards.card.id);
    this.lab.show();
    if (this.recognitionEnabled) void this.recognition.connect();
    this.onChange();
  }
  openTabletop() {
    if (!this.lab.open || !this.session.matchActive) return;
    this.labReplay?.stop();
    this.lab.tabletop.start();
    this.onChange();
  }
  closeLab() {
    this.lab.close();
    this.onChange();
  }
  replayLab() {
    if (!this.lab.open) return;
    this.labReplay ??= new LabReplay(document.createElement("video"));
    void this.labReplay.play(
      this.lab.view === "cards" ? this.lab.cards.card.id : cutback.id,
      this.lab.view === "cards" ? this.lab.cards.replayPath : undefined,
    );
    this.onChange();
  }
  labPrimary() {
    this.labReplay?.stop();
    if (this.lab.view === "cards") {
      this.lab.saved = readLabSave(localStorage, cutback.id);
      this.lab.round = 0;
      this.lab.begin();
    } else if (this.lab.phase === "complete") this.lab.reset();
    else if (
      this.lab.phase === "feedback" &&
      this.lab.correct &&
      !this.lab.demonstration
    )
      this.lab.next();
    else this.lab.begin();
    this.onChange();
  }
  changeLabCard(action: "next" | "previous" | "flip" | "story" | "browse") {
    if (!this.lab.open) return;
    this.labReplay?.stop();
    this.lab.notice = "";
    this.listenRequest++;
    this.audio.stop();
    this.labListening = false;
    if (action === "next" || action === "previous")
      this.lab.cards.move(action === "next" ? 1 : -1);
    else if (action === "flip") this.lab.cards.flip();
    else if (action === "story") this.lab.cards.toggleStory();
    else this.lab.browse();
    this.lab.saved = readLabSave(localStorage, this.lab.cards.card.id);
    this.onChange();
  }
  saveLab() {
    if (!this.lab.open) return;
    this.lab.saved = saveLabPhrase(
      localStorage,
      this.lab.view === "cards" ? this.lab.cards.card.id : cutback.id,
      this.lab.view === "cards" ? this.lab.cards.card : undefined,
    );
    this.lab.notice = this.lab.saved
      ? "Moment saved on this device."
      : "Could not save on this device. Try again.";
    this.onChange();
  }
  async listenLab() {
    if (!this.lab.open) return;
    this.coach?.stop();
    this.lab.notice = "";
    this.labListening = true;
    const request = ++this.listenRequest;
    const cardId =
      this.lab.view === "cards" ? this.lab.cards.audioId : cutback.id;
    if (!cardId) {
      this.labListening = false;
      this.lab.notice =
        "Draft audio is not prepared yet. Read the Spanish and check the replay.";
      this.onChange();
      return;
    }
    try {
      if (!this.audio.has(cardId))
        await this.audio.preload(cardId, `audio/${cardId}-es.mp3`);
      if (request !== this.listenRequest || !this.lab.open) return;
      await this.audio.listen(cardId);
    } catch {
      if (request === this.listenRequest)
        this.lab.notice =
          "Spanish audio unavailable. Read the phrase and try the board.";
    }
    this.onChange();
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
    this.lab.close();
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
    this.labReplay?.stop();
    this.lab.armed = false;
    this.labListening = false;
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
    this.lab.close();
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
    if (this.recognition.active) {
      if (!this.session.matchActive)
        this.recognition.stop("Analysis stopped on exit");
      else
        this.recognition.tick(
          this.player.position,
          this.player.playing,
          delta,
          this.player.video.seeking,
        );
    }
    if (!this.session.matchActive) this.lab.close();
    this.lab.frame(delta);
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
