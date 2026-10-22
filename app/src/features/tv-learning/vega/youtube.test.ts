import {describe, expect, it, vi} from 'vitest';
import {runInNewContext} from 'node:vm';
import {readYouTubePlayback, youtubeError, youtubePlayerHtml, youtubePlayerSource} from './youtube';

function playerHarness(restore = 0) {
  const messages: any[] = [];
  const player = {getCurrentTime: vi.fn(() => 0), getPlayerState: vi.fn(() => 5),
    pauseVideo: vi.fn(), playVideo: vi.fn(), loadVideoById: vi.fn(), cueVideoById: vi.fn()};
  let options: any, poll: () => void = () => {};
  const window: any = {ReactNativeWebView: {postMessage: (s: string) => messages.push(JSON.parse(s))}};
  const html = youtubePlayerHtml('WMjohb2tq7Y', 808, 36, restore);
  runInNewContext(html.match(/<script>([\s\S]*)<\/script>/)![1], {
    window, location: {protocol: 'file:', origin: 'null'}, URLSearchParams,
    YT: {Player: function (_id: string, config: any) { options = config; return player; }},
    setInterval: (callback: () => void) => { poll = callback; },
    document: {createElement: () => ({}), head: {appendChild: vi.fn()}},
  });
  window.onYouTubeIframeAPIReady(); options.events.onReady();
  return {messages, player, options, window, poll};
}

describe('YouTube playback authority', () => {
  it('uses the hosted video clock and emits no fabricated time while unstarted', () => {
    const h = playerHarness();
    expect(h.messages).toEqual([{type: 'ready'}]);
    h.player.getCurrentTime.mockReturnValue(814.5);
    h.player.getPlayerState.mockReturnValue(1); h.poll();
    expect(readYouTubePlayback(JSON.stringify(h.messages[h.messages.length - 1]), 36)).toEqual({
      position: 6.5, paused: false, ended: false, ready: true,
    });
    expect(h.player.playVideo).not.toHaveBeenCalled();
    expect(h.player.pauseVideo).not.toHaveBeenCalled();
    expect(h.player.loadVideoById).not.toHaveBeenCalled();
  });
  it('cues restored progress without autoplay; commands require explicit interaction', () => {
    const h = playerHarness(9);
    expect(h.options.playerVars.start).toBe(817);
    expect(h.options.playerVars.end).toBe(844);
    expect(h.options.playerVars.autoplay).toBe(0);
    expect(h.player.cueVideoById).toHaveBeenCalledWith({videoId: 'WMjohb2tq7Y', startSeconds: 817, endSeconds: 844});
    h.window.arenaCommand('toggle'); expect(h.player.playVideo).toHaveBeenCalledOnce();
    h.player.getPlayerState.mockReturnValue(1);
    h.window.arenaCommand('toggle'); expect(h.player.pauseVideo).toHaveBeenCalledOnce();
    h.window.arenaCommand('restart');
    expect(h.player.loadVideoById).toHaveBeenCalledWith({videoId: 'WMjohb2tq7Y', startSeconds: 808, endSeconds: 844});
  });
  it('rejects malformed bridge values and clamps legitimate source observations', () => {
    for (const data of ['invalid', 'null', '{}', '{"type":"playback","position":"12"}']) {
      expect(readYouTubePlayback(data, 36)).toBeNull();
    }
    expect(readYouTubePlayback(JSON.stringify({type: 'playback', position: 37, paused: true, ended: true}), 36)?.position).toBe(36);
    expect(() => youtubePlayerHtml('<script>', 808, 36, 0)).toThrow();
  });
  it('reports publisher and identity failures without replacing the media silently', () => {
    expect(youtubeError(150)).toContain('publisher');
    expect(youtubeError(153)).toContain('verify');
    expect(youtubeError('network')).toContain('connection');
  });
  it('identifies the installed app and permits HTTP only for the simulator host', () => {
    expect(youtubePlayerSource('https://example.com/player/', 9).uri).toBe('https://example.com/player/#position=9');
    expect(youtubePlayerSource('http://10.0.2.2:8766/', 40).uri).toContain('position=36');
    expect(() => youtubePlayerSource('http://example.com/', 0)).toThrow();
    expect(youtubePlayerSource('https://example.com/', 0).headers.Referer).toBe('https://com.arenavoca.tv/');
  });
});
