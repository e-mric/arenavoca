import type { Content, MatchEvent } from "../content/model";
import type { Playback } from "../playback/player";
import { Exposure, timelineAt } from "../playback/timeline";
import { emptySnapshot, ProgressStore, type Snapshot } from "../progress/store";
import { chantAt } from "../karaoke/karaoke";
import { teamsFor, type Sport } from "../theme/team-theme";
export type Mode =
  | "Loading"
  | "Onboarding"
  | "Watching"
  | "Exploring"
  | "PhraseLibrary"
  | "Completed"
  | "Suspended"
  | "Error";
export class Session {
  mode: Mode = "Loading";
  selected?: MatchEvent;
  exposure = new Exposure();
  snapshot: Snapshot;
  message = "Preparing your match…";
  private pendingPlay = false;
  private command = 0;
  private lastSavedPosition = 0;
  private finishedObserved = false;
  onChange = () => {};
  onStopAudio = () => {};
  constructor(
    readonly content: Content,
    readonly player: Playback,
    readonly progress: ProgressStore,
  ) {
    this.snapshot = emptySnapshot(content.version);
  }
  ready() {
    const restored = this.progress.read(this.content);
    this.snapshot = restored.snapshot;
    this.mode = "Onboarding";
    this.message = restored.warning ?? "Watch a match. Learn a little Spanish.";
    this.emit();
  }
  get phrase() {
    return this.content.phrases.find((p) => p.id === this.selected?.phraseId);
  }
  get prompt() {
    return timelineAt(
      this.content,
      this.player.position,
      this.snapshot.preferences.promptsHidden,
    ).event;
  }
  get caption() {
    if (this.snapshot.preferences.commentaryLanguage === "english")
      return timelineAt(this.content, this.player.position).caption;
    const cue = this.content.captions.find(
      (c) => this.player.position >= c.start && this.player.position < c.end,
    );
    return cue?.spanish ?? "";
  }
  get matchActive() {
    return ["Watching", "Exploring", "PhraseLibrary"].includes(this.mode);
  }
  get chant() {
    return this.matchActive
      ? chantAt(
          this.player.position,
          this.snapshot.preferences.team,
          this.snapshot.preferences.karaokeEnabled,
          this.content.version,
        )
      : undefined;
  }
  setSport(sport: Sport) {
    if (sport === this.snapshot.preferences.sport) return;
    this.snapshot.preferences = {
      ...this.snapshot.preferences,
      sport,
      team: "neutral",
    };
    if (this.mode === "Onboarding") this.progress.write(this.snapshot);
    this.persist();
    this.emit();
  }
  async start(resume = false) {
    this.onStopAudio();
    this.player.restart();
    this.command++;
    this.pendingPlay = false;
    this.mode = "Watching";
    this.selected = undefined;
    this.finishedObserved = false;
    this.lastSavedPosition = 0;
    const saved = resume ? this.snapshot.resumableSession : null;
    this.exposure = new Exposure(saved?.seenEventIds, saved?.seenPhraseIds);
    if (saved) this.player.restore(saved.position);
    this.message = "";
    await this.play();
    this.emit();
  }
  async play() {
    if (
      this.pendingPlay ||
      !this.matchActive ||
      this.player.position >= this.content.duration - 0.04
    )
      return;
    const token = ++this.command;
    this.pendingPlay = true;
    try {
      await this.player.play();
      if (token !== this.command) this.player.pause();
    } catch {
      if (token === this.command) {
        this.player.pause();
        this.message = "Playback could not start. Select Play to retry.";
      }
    } finally {
      if (token === this.command) this.pendingPlay = false;
      this.emit();
    }
  }
  async togglePlayback() {
    if (!this.matchActive) return;
    if (this.player.playing || this.pendingPlay) {
      this.halt();
      this.persist();
      this.emit();
    } else await this.play();
  }
  private halt() {
    this.command++;
    this.pendingPlay = false;
    this.player.pause();
  }
  tick() {
    if (!this.matchActive) return;
    if (this.mode === "Watching") {
      const prompt = this.prompt;
      if (prompt) {
        this.selected = prompt;
        this.exposure.display(prompt);
      } else if (this.selected) {
        this.selected = undefined;
        this.onStopAudio();
      }
    }
    if (this.player.position >= this.content.duration - 0.04) {
      if (this.finishedObserved) return;
      this.finishedObserved = true;
      this.halt();
      if (this.mode === "Watching") {
        this.mode = "Completed";
        this.onStopAudio();
      }
      this.persist();
    } else if (this.player.position - this.lastSavedPosition >= 2) {
      this.persist();
    }
    this.emit();
  }
  explore(event = this.selected) {
    if (
      this.mode !== "Watching" ||
      !event ||
      !this.exposure.events.has(event.id)
    )
      return;
    this.selected = event;
    this.onStopAudio();
    this.mode = "Exploring";
    this.persist();
    this.emit();
  }
  library() {
    if (!["Watching", "Completed"].includes(this.mode)) return;
    this.onStopAudio();
    this.mode = "PhraseLibrary";
    this.selected = this.content.events.find(
      (e) =>
        this.exposure.events.has(e.id) ||
        this.snapshot.savedPhraseIds.includes(e.phraseId),
    );
    this.emit();
  }
  async back() {
    if (!["Exploring", "PhraseLibrary"].includes(this.mode)) return;
    this.onStopAudio();
    this.mode =
      this.player.position >= this.content.duration - 0.04
        ? "Completed"
        : "Watching";
    this.selected = undefined;
    this.emit();
  }
  suspend() {
    if (["Onboarding", "Loading", "Error", "Suspended"].includes(this.mode))
      return;
    this.halt();
    this.onStopAudio();
    this.mode = "Suspended";
    this.persist();
    this.message = "Match paused. Resume when you are ready.";
    this.emit();
  }
  async resume() {
    if (this.mode !== "Suspended") return;
    this.mode =
      this.player.position >= this.content.duration - 0.04
        ? "Completed"
        : "Watching";
    this.selected = undefined;
    this.message = "";
    if (this.mode === "Watching") await this.play();
    this.emit();
  }
  async restart() {
    this.onStopAudio();
    this.halt();
    this.player.restart();
    this.exposure.restart();
    this.selected = undefined;
    this.snapshot.resumableSession = null;
    this.lastSavedPosition = 0;
    this.finishedObserved = false;
    this.mode = "Watching";
    this.message = "";
    this.persist();
    await this.play();
  }
  save() {
    if (!this.phrase) return;
    const next = this.progress.savePhrase(
      this.currentSnapshot(),
      this.phrase.id,
    );
    if (next) {
      this.snapshot = next;
      this.message = "Phrase saved on this device.";
    } else
      this.message = "Could not save on this device. Please retry Save phrase.";
    this.emit();
  }
  setPreference<K extends keyof Snapshot["preferences"]>(
    key: K,
    value: Snapshot["preferences"][K],
  ) {
    if (
      key === "team" &&
      value !== "neutral" &&
      !teamsFor(this.snapshot.preferences.sport).includes(
        value as import("../theme/team-theme").Team,
      )
    )
      return;
    this.snapshot.preferences = { ...this.snapshot.preferences, [key]: value };
    if (this.mode === "Onboarding" && !this.progress.write(this.snapshot))
      this.message = "Display preferences could not be stored on this device.";
    if (key === "promptsHidden" && value && this.mode === "Watching") {
      this.selected = undefined;
      this.onStopAudio();
    }
    this.persist();
    this.emit();
  }
  fail(message: string) {
    this.halt();
    this.onStopAudio();
    this.mode = "Error";
    this.message = message;
    this.emit();
  }
  currentSnapshot(): Snapshot {
    return {
      ...this.snapshot,
      resumableSession: {
        position: this.player.position,
        seenEventIds: [...this.exposure.events],
        seenPhraseIds: [...this.exposure.phrases],
        completed: this.player.position >= this.content.duration - 0.04,
      },
    };
  }
  persist() {
    if (this.mode === "Loading" || this.mode === "Onboarding") return;
    const next = this.currentSnapshot();
    this.lastSavedPosition = this.player.position;
    if (this.progress.write(next)) {
      this.snapshot = next;
      this.lastSavedPosition = this.player.position;
    } else if (!this.message)
      this.message = "Progress could not be stored on this device.";
  }
  private emit() {
    this.onChange();
  }
}
