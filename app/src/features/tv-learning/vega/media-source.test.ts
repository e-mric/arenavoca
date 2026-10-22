import {expect, it} from 'vitest';
import {mediaSource} from './media-source';
it('converts Metro bundled file URLs to the paths accepted by Vega playback', () => {
  expect(mediaSource('file:///pkg/bundle/assets/.generated/match.mp4')).toBe(
    '/pkg/bundle/assets/.generated/match.mp4',
  );
  expect(mediaSource('file:///pkg/bundle/match%20one.mp4')).toBe(
    '/pkg/bundle/match one.mp4',
  );
});
it('preserves network and already resolved sources', () => {
  expect(mediaSource('https://example.com/video.mp4')).toBe(
    'https://example.com/video.mp4',
  );
  expect(mediaSource('/pkg/match.mp4')).toBe('/pkg/match.mp4');
});
