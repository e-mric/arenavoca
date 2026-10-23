import {expect, it, vi} from 'vitest';
import {toggleUnlessHandled} from './playback';

function harness(paused: boolean) {
  const state = {paused}, toggle = vi.fn(() => { state.paused = !state.paused; });
  let check = () => {};
  toggleUnlessHandled(() => state.paused, toggle, c => { check = c; });
  return {state, toggle, check: () => check()};
}
it('pauses when the platform session dropped the remote key', () => {
  const h = harness(false);
  h.check();
  expect(h.toggle).toHaveBeenCalledOnce();
  expect(h.state.paused).toBe(true);
});
it('does not toggle again when the platform session already acted', () => {
  const h = harness(false);
  h.state.paused = true;
  h.check();
  expect(h.toggle).not.toHaveBeenCalled();
  expect(h.state.paused).toBe(true);
});
it('resumes a paused match once', () => {
  const h = harness(true);
  h.check();
  expect(h.toggle).toHaveBeenCalledOnce();
  expect(h.state.paused).toBe(false);
});
