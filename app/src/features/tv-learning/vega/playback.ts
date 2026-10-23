export type Playback = {position: number; paused: boolean; ended: boolean; ready: boolean};
export type PlayerControls = {toggle(): void; restart(): void; remoteKey?(): void};

/**
 * Vega's player session may already act on a remote play/pause key, but it drops
 * keys while its state lags (e.g. after Restart). Toggle only if nothing changed.
 */
export function toggleUnlessHandled(isPaused: () => boolean, toggle: () => void,
  later: (check: () => void) => void) {
  const before = isPaused();
  later(() => { if (isPaused() === before) toggle(); });
}
