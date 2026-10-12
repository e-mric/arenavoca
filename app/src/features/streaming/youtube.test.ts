import { describe, expect, it, vi } from "vitest";
import { StreamPlayback, youtubeError, type YouTubePlayer } from "./youtube";
import { sources } from "./catalog";
function fixture(state = 1) {
  const player: YouTubePlayer = {
    cueVideoById: vi.fn(),
    playVideo: vi.fn(),
    pauseVideo: vi.fn(),
    seekTo: vi.fn(),
    getCurrentTime: () => 42,
    getDuration: () => 100,
    getPlayerState: () => state,
    getVolume: () => 100,
    setVolume: vi.fn(),
    isMuted: () => false,
    mute: vi.fn(),
    unMute: vi.fn(),
    getVideoData: () => ({ video_id: sources[0].videoId }),
    destroy: vi.fn(),
  };
  return { player, playback: new StreamPlayback(player) };
}
describe("YouTube playback authority", () => {
  it("observes the publisher clock without issuing playback commands", () => {
    const { player, playback } = fixture();
    expect([
      playback.position,
      playback.duration,
      playback.playing,
      playback.videoId,
    ]).toEqual([42, 100, true, sources[0].videoId]);
    expect(player.playVideo).not.toHaveBeenCalled();
    expect(player.pauseVideo).not.toHaveBeenCalled();
    expect(player.seekTo).not.toHaveBeenCalled();
  });
  it.each([1, 3])(
    "explicit pause stops playing or buffering state %s",
    (state) => {
      const { player, playback } = fixture(state);
      playback.toggle();
      expect(player.pauseVideo).toHaveBeenCalledOnce();
      expect(player.playVideo).not.toHaveBeenCalled();
    },
  );
  it.each([-1, 0, 2, 5])("explicit play starts stopped state %s", (state) => {
    const { player, playback } = fixture(state);
    playback.toggle();
    expect(player.playVideo).toHaveBeenCalledOnce();
  });
  it("only an explicit valid bookmark seek changes position", () => {
    const { player, playback } = fixture();
    playback.seek(NaN);
    playback.seek(-1);
    expect(player.seekTo).not.toHaveBeenCalled();
    playback.seek(200);
    expect(player.seekTo).toHaveBeenCalledWith(100, true);
  });
  it("cues a new source without automatically playing it", () => {
    const { player, playback } = fixture();
    playback.source(sources[1]);
    expect(player.cueVideoById).toHaveBeenCalledWith(sources[1].videoId);
    expect(player.playVideo).not.toHaveBeenCalled();
  });
  it.each([101, 150])("reports embed restriction %s honestly", (code) => {
    expect(youtubeError(code)).toContain("disabled embedded playback");
  });
  it("distinguishes unavailable videos and missing identity", () => {
    expect(youtubeError(100)).toContain("unavailable or private");
    expect(youtubeError(153)).toContain("identify this page");
  });
});
