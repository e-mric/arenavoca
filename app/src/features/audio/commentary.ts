import { assetUrl } from "../content/model";
export type CommentaryLanguage = "english" | "spanish";
export interface CommentaryMedia {
  src: string;
  preload: string;
  currentTime: number;
  volume: number;
  play(): Promise<void>;
  pause(): void;
  load(): void;
  addEventListener(type: string, callback: () => void): void;
}
/** The match video remains the clock. English is embedded; Spanish is a prepared
 * alternate track with the same silence and cue positions as the video.
 */
export class Commentary {
  ready = false;
  onError = () => {};
  private objectUrl?: string;
  private wanted = false;
  private command = 0;
  constructor(readonly media: CommentaryMedia = new Audio()) {
    media.preload = "auto";
    media.addEventListener("error", () => this.unavailable());
  }
  async load(path: string) {
    const response = await fetch(assetUrl(path));
    if (!response.ok) throw new Error("Spanish commentary could not load.");
    const blob = await response.blob();
    if (!blob.size) throw new Error("Spanish commentary is empty.");
    this.objectUrl = URL.createObjectURL(blob);
    this.media.src = this.objectUrl;
    this.media.load();
    this.ready = true;
  }
  sync(
    video: { currentTime: number; paused: boolean; ended: boolean },
    language: CommentaryLanguage,
    volume: number,
  ) {
    this.media.volume = volume;
    if (language !== "spanish" || !this.ready || video.paused || video.ended) {
      if (this.wanted) this.stop();
      return;
    }
    if (Math.abs(this.media.currentTime - video.currentTime) > 0.15)
      this.media.currentTime = video.currentTime;
    if (this.wanted) return;
    this.wanted = true;
    const token = ++this.command;
    void this.media
      .play()
      .then(() => {
        if (token !== this.command && !this.wanted) this.media.pause();
      })
      .catch(() => {
        if (token === this.command) this.unavailable();
      });
  }
  stop() {
    this.command++;
    this.wanted = false;
    this.media.pause();
  }
  private unavailable() {
    this.ready = false;
    this.stop();
    this.onError();
  }
  destroy() {
    this.stop();
    this.media.src = "";
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }
}
