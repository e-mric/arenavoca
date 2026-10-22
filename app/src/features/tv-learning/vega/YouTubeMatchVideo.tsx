import React, {useEffect, useMemo, useRef, useState} from 'react';
import {AppState, View} from 'react-native';
import {WebView} from '@amazon-devices/webview';
import type {Playback, PlayerControls} from './playback';
import {readYouTubePlayback, youtubeError, youtubePlayerSource} from './youtube';
import {youtubePlayerUrl} from '../../../../native/vegaTV/generated/content';

type Props = {
  videoId: string; start: number; duration: number; restore: number;
  onObserve(state: Playback): void;
  onControls(controls: PlayerControls | null): void;
  onError(error: string): void;
  onLeave(position: number): void;
};

/** A persistent official player; sidebar changes send no playback commands. */
export function YouTubeMatchVideo(props: Props) {
  const view = useRef<React.ElementRef<typeof WebView>>(null);
  const callbacks = useRef(props); callbacks.current = props;
  const last = useRef<Playback>({position: props.restore, paused: true, ended: false, ready: false});
  const ready = useRef(false);
  const [status, setStatus] = useState('Loading YouTube');
  const source = useMemo(() => youtubePlayerSource(youtubePlayerUrl, props.restore), [props.restore]);
  const command = (action: 'toggle' | 'pause' | 'restart') => {
    view.current?.injectJavaScript(`window.arenaCommand && window.arenaCommand(${JSON.stringify(action)});true;`);
  };
  useEffect(() => {
    callbacks.current.onControls({toggle: () => command('toggle'), restart: () => command('restart')});
    const timeout = setTimeout(() => {
      if (!ready.current) callbacks.current.onError(youtubeError('timeout'));
    }, 25000);
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') { command('pause'); callbacks.current.onLeave(last.current.position); }
    });
    return () => {
      clearTimeout(timeout); sub.remove();
      callbacks.current.onControls(null); callbacks.current.onLeave(last.current.position);
    };
  }, []);
  return <View style={{flex: 1, width: '100%'}} testID="youtube-player" accessibilityLabel={status}>
    <WebView ref={view} source={source} style={{flex: 1}}
      javaScriptEnabled domStorageEnabled allowsDefaultMediaControl={false}
      mediaPlaybackRequiresUserAction={false}
      onError={() => callbacks.current.onError(youtubeError('network'))}
      onMessage={event => {
        const data = event.nativeEvent.data;
        const state = readYouTubePlayback(data, props.duration);
        if (state) {
          const value = JSON.parse(data);
          if (Number.isFinite(value.sourceSeconds)) setStatus(`${value.buffering ? 'Buffering' : state.paused ? 'Paused' : 'Playing'} YouTube at ${Math.floor(value.sourceSeconds)} seconds`);
          last.current = state; callbacks.current.onObserve(state); return;
        }
        try {
          const value = JSON.parse(data);
          if (value.type === 'ready') {
            callbacks.current.onError('');
            ready.current = true; last.current = {...last.current, ready: true};
            setStatus('YouTube ready');
            callbacks.current.onObserve(last.current);
          }
          if (value.type === 'error') callbacks.current.onError(youtubeError(value.code));
        } catch { /* Ignore unrelated WebView messages. */ }
      }} />
  </View>;
}
