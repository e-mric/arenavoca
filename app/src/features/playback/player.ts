import { assetUrl } from "../content/model";
export interface Playback {
  readonly position: number;
  readonly playing: boolean;
  play(): Promise<void>;
  pause(): void;
  restart(): void;
  restore(position: number): void;
}
export class MatchPlayer implements Playback {
  readonly video: HTMLVideoElement;
  private objectUrl?: string;
  constructor(video = document.createElement("video")) {
    this.video = video;
    video.playsInline = true;
    video.preload = "auto";
    video.controls = false;
  }
  get position() {
    return this.video.currentTime;
  }
  get playing() {
    return !this.video.paused && !this.video.ended;
  }
  async load(path: string) {
    // Fully fetched Blob avoids a streaming dependency during a loaded session.
    const response = await fetch(assetUrl(path));
    if (!response.ok)
      throw new Error("The match video could not load. Please retry.");
    const blob = await response.blob();
    if (!blob.size) throw new Error("The match video is empty. Please retry.");
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = URL.createObjectURL(blob);
    await this.decode(this.objectUrl);
  }
  /** Full matches buffer from the local server rather than preloading gigabytes. */
  async loadStream(path: string) {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = undefined;
    this.video.crossOrigin = "anonymous";
    this.video.preload = "metadata";
    await this.decode(assetUrl(path));
  }
  private decode(source: string) {
    return new Promise<void>((resolve, reject) => {
      const clear = () => {
        clearTimeout(timeout);
        this.video.removeEventListener("loadeddata", ready);
        this.video.removeEventListener("error", error);
      };
      const ready = () => {
        clear();
        resolve();
      };
      const error = () => {
        clear();
        reject(
          new Error(
            "This browser could not play the match video. Please retry.",
          ),
        );
      };
      const timeout = setTimeout(error, 30_000);
      this.video.addEventListener("loadeddata", ready);
      this.video.addEventListener("error", error);
      this.video.src = source;
      this.video.load();
    });
  }
  play() {
    return this.video.play();
  }
  pause() {
    this.video.pause();
  }
  restore(position: number) {
    this.pause();
    this.video.currentTime = position;
  }
  restart() {
    this.pause();
    this.video.currentTime = 0;
  }
  destroy() {
    this.pause();
    this.video.removeAttribute("src");
    this.video.load();
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }
}
