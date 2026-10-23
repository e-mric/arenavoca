export type Playback = {position: number; paused: boolean; ended: boolean; ready: boolean};
export type PlayerControls = {toggle(): void; restart(): void; remoteKey?(): void};

export type RemoteTarget = 'play' | 'pause' | 'restart';

/** The state a remote Play/Pause key asks for, decided when the key is pressed. */
export function remoteKeyTarget(paused: boolean, ended: boolean): RemoteTarget {
  return ended ? 'restart' : paused ? 'play' : 'pause';
}

/**
 * Vega's player session may or may not act on the key (it drops keys while its
 * state lags, e.g. after Restart, and may answer Pause with play()). Afterwards,
 * act only if the player is not yet in the target state: a redundant play() on a
 * playing Vega player stops its timeupdate events.
 */
export function settleRemoteKey(target: RemoteTarget, state: {paused: boolean; ended: boolean},
  player: {play(): void; pause(): void; rewind(): void}) {
  if (target === 'pause') {
    if (!state.paused && !state.ended) player.pause();
    return;
  }
  if (state.ended) player.rewind();
  if (state.paused || state.ended) player.play();
}
