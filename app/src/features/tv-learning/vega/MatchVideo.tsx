import {mediaSource} from './media-source';
import React, {useEffect, useRef, useState} from 'react';
import {AppState, Image, View, useWindowDimensions} from 'react-native';
// Avoid evaluating unused SDK MediaControls (SliderMetaData has a forwardRef warning).
// These interfaces are published in the pinned SDK's system-module manifest.
import {VideoPlayer} from '@amazon-devices/react-native-w3cmedia/dist/interface/VideoPlayer';
import {KeplerVideoSurfaceView} from '@amazon-devices/react-native-w3cmedia/dist/interface/KeplerVideoSurfaceView';
import {toggleUnlessHandled, type Playback, type PlayerControls} from './playback';
export type {Playback, PlayerControls} from './playback';
type Props = {
  asset: number;
  endFrame: number;
  restore: number;
  compact: boolean;
  onObserve(s: Playback): void;
  onError(error: string): void;
  onControls(c: PlayerControls | null): void;
  onLeave(position: number): void;
};
/** Scale one persistent surface; learning never clears the paused video buffer. */
export function MatchVideo(props: Props) {
  const {width: screenWidth} = useWindowDimensions();
  const width = props.compact ? Math.floor(screenWidth * 0.72) : screenWidth;
  const [scaling, setScaling] = useState<'fit' | 'fill'>('fit');
  useEffect(() => {
    const timer = setTimeout(() => setScaling((mode) => mode === 'fit' ? 'fill' : 'fit'), 100);
    return () => clearTimeout(timer);
  }, [width]);
  const callbacks = useRef(props);
  callbacks.current = props;
  const [ended, setEnded] = useState(false);
  const [player] = useState(() => new VideoPlayer());
  const active = useRef(true),
    initialized = useRef(false),
    ready = useRef(false);
  const surface = useRef<string | null>(null);
  useEffect(() => {
    active.current = true;
    const observe = () => {
      if (active.current && initialized.current) {
        setEnded(player.ended);
        callbacks.current.onObserve({
          position: player.currentTime || 0,
          paused: player.paused || player.ended,
          ended: player.ended,
          ready: ready.current,
        });
      }
    };
    const failure = (cause?: unknown) => {
      console.error('ArenaVoca playback error', player.error, cause);
      callbacks.current.onError(
        'This video could not be loaded. Please try again.'
      );
    };
    const metadata = () => {
      ready.current = true;
      if (props.restore > 0) player.currentTime = props.restore;
      observe();
    };
    const events = ['timeupdate', 'play', 'pause', 'ended', 'seeked'] as const;
    player
      .initialize()
      .then(() => {
        initialized.current = true;
        if (!active.current) {
          void player.deinitialize();
          return;
        }
        events.forEach((e) => player.addEventListener(e, observe));
        player.addEventListener('loadedmetadata', metadata);
        player.addEventListener('error', failure);
        if (surface.current) player.setSurfaceHandle(surface.current);
        player.autoplay = false;
        player.src = mediaSource(Image.resolveAssetSource(props.asset).uri);
        console.info('ArenaVoca video source', player.src);
        const toggle = () => {
          if (!ready.current) return;
          if (player.paused || player.ended) {
            if (player.ended) player.currentTime = 0;
            void player.play().catch(failure);
          } else player.pause();
        };
        callbacks.current.onControls({
          toggle,
          remoteKey: () => toggleUnlessHandled(() => player.paused || player.ended, toggle,
            (check) => setTimeout(() => active.current && check(), 400)),
          restart: () => {
            if (!ready.current) return;
            player.currentTime = 0;
            void player.play().catch(failure);
          },
        });
      })
      .catch(failure);
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && initialized.current) {
        player.pause();
        callbacks.current.onLeave(player.currentTime || 0);
      }
    });
    return () => {
      active.current = false;
      sub.remove();
      callbacks.current.onControls(null);
      if (initialized.current) {
        callbacks.current.onLeave(player.currentTime || 0);
        events.forEach((e) => player.removeEventListener(e, observe));
        player.removeEventListener('loadedmetadata', metadata);
        player.removeEventListener('error', failure);
        player.pause();
        void player.deinitialize();
      }
    };
  }, [player, props.asset, props.restore]);
  return (
    <View style={{width: '100%', aspectRatio: 16 / 9}} testID="match-video">
      <KeplerVideoSurfaceView
        scalingmode={scaling}
        style={{width, height: width * 9 / 16}}
        onSurfaceViewCreated={(handle: string) => {
          surface.current = handle;
          if (initialized.current) player.setSurfaceHandle(handle);
        }}
        onSurfaceViewDestroyed={(handle: string) => {
          if (surface.current === handle) surface.current = null;
          if (initialized.current) player.clearSurfaceHandle(handle);
        }}
      />
      {ended && (
        <Image
          testID="ended-frame"
          source={props.endFrame}
          resizeMode="contain"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
      )}
    </View>
  );
}
