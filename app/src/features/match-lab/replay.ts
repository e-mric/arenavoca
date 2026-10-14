import { assetUrl } from "../content/model";
/** Only the separate, pre-cut replay is controlled here. Never accepts the match video. */
export class LabReplay {
  private generation = 0;
  visible = false;
  error = "";
  status = "Silent excerpt / match clock 10:27-10:30";
  constructor(readonly video: HTMLVideoElement) {
    video.muted = true;
    video.playsInline = true;
    video.preload = "none";
    video.dataset.labReplay = "true";
    video.addEventListener("ended", () => {
      this.status = "Moment finished. Try the pass on the board.";
    });
    video.addEventListener("error", () => {
      this.stop();
      this.error = this.status =
        "Replay unavailable. You can still use the teaching board.";
    });
  }
  async play(cardId = "alba-cutback", replayPath?: string) {
    const request = ++this.generation;
    this.error = "";
    this.visible = true;
    this.status = "Silent replay of the selected moment";
    const src = assetUrl(replayPath ?? `media/user/${cardId}.mp4`);
    if (this.video.getAttribute("src") !== src) this.video.src = src;
    this.video.currentTime = 0;
    try {
      await this.video.play();
      if (request !== this.generation && !this.visible) this.video.pause();
    } catch {
      if (request === this.generation) {
        this.error = this.status =
          "Replay unavailable. You can still use the teaching board.";
        this.visible = false;
      }
    }
  }
  stop() {
    this.error = "";
    this.generation++;
    this.video.pause();
    this.visible = false;
  }
  destroy() {
    this.stop();
    this.video.removeAttribute("src");
    this.video.load();
    this.video.remove();
  }
}
