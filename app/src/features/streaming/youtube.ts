import type { StreamSource } from "./catalog";
export interface YouTubePlayer {
  cueVideoById(id: string): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(position: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  getVolume(): number;
  setVolume(volume: number): void;
  isMuted(): boolean;
  mute(): void;
  unMute(): void;
  getVideoData(): { video_id?: string };
  destroy(): void;
}
interface YouTubeAPI {
  Player: new (
    element: string,
    options: {
      videoId: string;
      width: string;
      height: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: () => void;
        onStateChange: () => void;
        onError: (event: { data: number }) => void;
        onAutoplayBlocked: () => void;
      };
    },
  ) => YouTubePlayer;
}
declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}
let apiPromise: Promise<YouTubeAPI> | undefined;
export function loadYouTubeAPI(): Promise<YouTubeAPI> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      apiPromise = undefined;
      reject(
        new Error(
          "YouTube did not connect. Retry, or open the source on YouTube.",
        ),
      );
    }, 20000);
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeout);
      if (window.YT?.Player) resolve(window.YT);
      else {
        apiPromise = undefined;
        reject(new Error("YouTube player is unavailable."));
      }
    };
    const previous = document.getElementById("youtube-api");
    previous?.remove();
    const script = document.createElement("script");
    script.id = "youtube-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      clearTimeout(timeout);
      apiPromise = undefined;
      reject(
        new Error(
          "YouTube could not load. Check your connection or open the source on YouTube.",
        ),
      );
    };
    document.head.append(script);
  });
  return apiPromise;
}
export function youtubeError(code: number) {
  if (code === 101 || code === 150)
    return "This uploader has disabled embedded playback. Open the source on YouTube; the companion remains available.";
  if (code === 100)
    return "This video is unavailable or private. The learning companion remains available.";
  if (code === 153)
    return "YouTube could not identify this page. Open the test URL in a regular browser, or use the source link.";
  return `YouTube playback failed (${code}). Retry, or open the source on YouTube.`;
}
/** Exploration never calls play/pause/seek; only explicit playback commands do. */
export class StreamPlayback {
  constructor(readonly player: YouTubePlayer) {}
  get position() {
    return Math.max(0, this.player.getCurrentTime() || 0);
  }
  get duration() {
    return Math.max(0, this.player.getDuration() || 0);
  }
  get playing() {
    return this.player.getPlayerState() === 1;
  }
  get videoId() {
    return this.player.getVideoData().video_id;
  }
  get buffering() {
    return this.player.getPlayerState() === 3;
  }
  toggle() {
    if (this.playing || this.player.getPlayerState() === 3)
      this.player.pauseVideo();
    else this.player.playVideo();
  }
  seek(position: number) {
    if (!Number.isFinite(position) || position < 0) return;
    this.player.seekTo(
      this.duration > 0 ? Math.min(position, this.duration) : position,
      true,
    );
  }
  source(source: StreamSource) {
    this.player.cueVideoById(source.videoId);
  }
}
