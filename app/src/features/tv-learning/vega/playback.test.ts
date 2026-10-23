import {expect, it, vi} from 'vitest';
import {remoteKeyTarget, settleRemoteKey} from './playback';

const player = () => ({play: vi.fn(), pause: vi.fn(), rewind: vi.fn()});
const playing = {paused: false, ended: false}, paused = {paused: true, ended: false};
const ended = {paused: true, ended: true};

it('asks to pause while playing, play while paused and restart after the end', () => {
  expect(remoteKeyTarget(false, false)).toBe('pause');
  expect(remoteKeyTarget(true, false)).toBe('play');
  expect(remoteKeyTarget(true, true)).toBe('restart');
});
it('pauses when the session answered Pause with play() or ignored it', () => {
  // Regression: a stale session replied to Pause with play(); the match kept playing.
  const p = player();
  settleRemoteKey('pause', playing, p);
  expect(p.pause).toHaveBeenCalledOnce();
});
it('does nothing more once the session already reached the target', () => {
  // Regression: a redundant play() stopped timeupdate, freezing the cards' clock.
  const afterPlay = player(), afterPause = player();
  settleRemoteKey('play', playing, afterPlay);
  settleRemoteKey('pause', paused, afterPause);
  expect(afterPlay.play).not.toHaveBeenCalled();
  expect(afterPause.pause).not.toHaveBeenCalled();
});
it('plays when the session dropped the key', () => {
  const p = player();
  settleRemoteKey('play', paused, p);
  expect(p.play).toHaveBeenCalledOnce();
});
it('rewinds only if the match is still at its end', () => {
  const atEnd = player(), restarted = player();
  settleRemoteKey('restart', ended, atEnd);
  settleRemoteKey('restart', playing, restarted);
  expect(atEnd.rewind).toHaveBeenCalledOnce();
  expect(atEnd.play).toHaveBeenCalledOnce();
  expect(restarted.rewind).not.toHaveBeenCalled();
  expect(restarted.play).not.toHaveBeenCalled();
});
