import React, {useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useTVEventHandler} from '@amazon-devices/react-native-kepler';
import {
  sequence as localSequence,
  enableYouTube,
  youtubeSequence,
  videoAsset,
  endFrameAsset,
  artwork,
} from '../../../../native/vegaTV/generated/content';
import {Learning, recallChoices, type Sequence} from './learning';
import {LocalProgress} from './storage';
import AsyncStorage from '@amazon-devices/react-native-async-storage__async-storage';
import {MatchVideo, type Playback, type PlayerControls} from './MatchVideo';
import {YouTubeMatchVideo} from './YouTubeMatchVideo';

type Route =
  | 'watch'
  | 'controls'
  | 'moments'
  | 'saved'
  | 'card'
  | 'about'
  | 'recall';
const colors = {
  cream: '#FFF9EF',
  navy: '#172452',
  blue: '#2045F5',
  lavender: '#EAE3FF',
  coral: '#FFC1B5',
};
function Action({
  id,
  label,
  onPress,
  first = false,
  disabled = false,
  compact = false,
  footer = false,
  image,
}: {
  id: string;
  label: string;
  onPress(): void;
  first?: boolean;
  disabled?: boolean;
  compact?: boolean;
  footer?: boolean;
  image?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      testID={id}
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      hasTVPreferredFocus={first}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      style={[
        styles.button,
        compact && styles.compactButton,
        footer && styles.footerButton,
        image !== undefined && styles.momentRow,
        focused && styles.focused,
        disabled && {opacity: 0.5},
      ]}
    >
      {image !== undefined && (
        <Image source={image} style={styles.thumbnail} resizeMode="contain" />
      )}
      <Text
        style={[
          styles.buttonText,
          compact && styles.compactText,
          image !== undefined && styles.momentText,
          (focused || footer) && {color: 'white'},
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function App() {
  const [useYouTube, setUseYouTube] = useState(enableYouTube);
  const sequence: Sequence = useYouTube ? youtubeSequence : localSequence;
  return <MatchExperience key={sequence.id} sequence={sequence}
    switchSource={() => setUseYouTube(!useYouTube)} />;
}
function MatchExperience({sequence, switchSource}: {sequence: Sequence; switchSource(): void}) {
  const [learning] = useState(() => new Learning(sequence));
  const [store] = useState(() => new LocalProgress(sequence, AsyncStorage));
  const [, render] = useState(0);
  const [route, setRoute] = useState<Route>('watch');
  const [origin, setOrigin] = useState<'moments' | 'saved'>('moments');
  const [saved, setSaved] = useState<string[]>([]);
  const [restored, setRestored] = useState<number | null>(null);
  const [saving, setSaving] = useState(false),
    [notice, setNotice] = useState(''),
    [error, setError] = useState(''),
    [storageError, setStorageError] = useState('');
  const [attempt, setAttempt] = useState(0),
    [answer, setAnswer] = useState<string | null>(null);
  const [playback, setPlayback] = useState<Playback>({
    position: 0,
    paused: true,
    ended: false,
    ready: false,
  });
  const controls = useRef<PlayerControls | null>(null),
    lastWrite = useRef(-1),
    announced = useRef(0);
  const refresh = () => render((x) => x + 1);
  useEffect(() => {
    let mounted = true;
    store
      .read()
      .then((p) => {
        if (mounted) {
          setSaved(p.saved);
          setRestored(p.position);
          learning.observe(p.position);
          announced.current = learning.available.length;
        }
      })
      .catch(() => {
        if (mounted) {
          setStorageError('Saved progress could not be loaded.');
          setRestored(0);
        }
      });
    return () => {
      mounted = false;
    };
  }, [store, learning]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  const persist = (position: number) => {
    void store
      .position(position)
      .catch(() => setStorageError('Playback position could not be saved.'));
  };
  const observe = (state: Playback) => {
    learning.observe(state.position);
    setPlayback(state);
    if (learning.available.length > announced.current) {
      announced.current = learning.available.length;
      setNotice('New moment');
    }
    if (
      state.ready &&
      (Math.abs(state.position - lastWrite.current) >= 2 ||
        (state.paused && state.position !== lastWrite.current))
    ) {
      lastWrite.current = state.position;
      persist(state.position);
    }
  };
  const back = () => {
    if (route === 'watch') return false;
    if (route === 'card') {
      learning.close();
      setRoute('watch');
    } else if (route === 'recall') {
      setAnswer(null);
      setRoute('card');
    } else {
      learning.close();
      setRoute('watch');
    }
    return true;
  };
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', back);
    return () => sub.remove();
  });
  useTVEventHandler((event) => {
    if (event.eventKeyAction === 0) return;
    if (event.eventType === 'playpause') {
      controls.current?.toggle();
      return;
    }
    if (
      route === 'watch' &&
      ['up', 'down', 'left', 'right'].includes(event.eventType)
    )
      setRoute('controls');
  });
  const open = (id: string, from: 'moments' | 'saved') => {
    if (learning.open(id, from === 'saved' ? saved : [])) {
      setOrigin(from);
      setRoute('card');
      setAnswer(null);
      refresh();
    }
  };
  const save = async () => {
    const card = learning.selected;
    if (!card || saving || saved.includes(card.id)) return;
    setSaving(true);
    const next = [...saved, card.id];
    try {
      await store.save(next);
      setSaved(next);
      setStorageError('');
    } catch {
      setStorageError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  const panel = !['watch', 'controls'].includes(route),
    card = learning.selected;
  const rows =
    route === 'saved'
      ? sequence.moments.filter((m) => saved.includes(m.id))
      : learning.available;
  return (
    <View style={styles.root}>
      <View
        testID="playback"
        accessibilityLabel={`${
          playback.paused ? 'Paused' : 'Playing'
        } at ${playback.position.toFixed(1)} seconds`}
        style={[styles.videoArea, {width: panel ? '72%' : '100%'}]}
      >
        {restored !== null && (sequence.youtube ? (
          <YouTubeMatchVideo key={attempt}
            videoId={sequence.youtube.videoId} start={sequence.youtube.startSeconds}
            duration={sequence.duration} restore={restored}
            onObserve={observe} onError={setError}
            onControls={c => { controls.current = c; }} onLeave={persist} />
        ) : (
          <MatchVideo
            key={attempt}
            asset={videoAsset}
            endFrame={endFrameAsset}
            restore={restored}
            compact={panel}
            onObserve={observe}
            onError={setError}
            onControls={(c) => {
              controls.current = c;
            }}
            onLeave={persist}
          />
        ))}
        {!sequence.youtube && route === 'watch' && (
          <Pressable
            testID="watch-surface"
            accessibilityLabel={
              notice && !playback.paused
                ? 'Open new moments'
                : 'Show match controls'
            }
            hasTVPreferredFocus
            onPress={() =>
              setRoute(notice && !playback.paused ? 'moments' : 'controls')
            }
            style={styles.watchTarget}
          />
        )}
        {!sequence.youtube && route === 'watch' && playback.paused && !error && (
          <View pointerEvents="none" style={styles.watchHint}>
            <Text style={styles.title}>{sequence.title}</Text>
            <Text style={styles.subtitle}>
              {playback.ended
                ? 'Sequence finished · Select for options'
                : 'Select to show controls'}
            </Text>
          </View>
        )}
        {!sequence.youtube && !!notice && route === 'watch' && !playback.paused && (
          <View pointerEvents="none" style={styles.invitation}>
            <Text style={styles.invitationTitle}>{notice}</Text>
            <Text style={styles.small}>OK · Open</Text>
          </View>
        )}
        {!sequence.youtube && !!error && (
          <View style={styles.error}>
            <Text style={styles.title}>{error}</Text>
            <Action
              id="retry"
              label="Try again"
              first
              onPress={() => {
                setError('');
                setPlayback((p) => ({...p, ready: false}));
                setAttempt((a) => a + 1);
              }}
            />
          </View>
        )}
        {(route === 'controls' || !!sequence.youtube) && (
          <View style={[styles.controls, sequence.youtube && styles.youtubeControls]}>
            {!!sequence.youtube && !!error && <Text testID="youtube-error" style={styles.body}>{error}</Text>}
            <View style={styles.controlHeading}>
              <Text style={styles.controlTitle}>{sequence.title}</Text>
              <Text testID="playback-time" style={styles.small}>
                {Math.floor(playback.position)} / {sequence.duration}s ·{' '}
                {playback.paused ? 'Paused' : 'Playing'}
              </Text>
            </View>
            <View style={styles.row}>
              <Action
                id="play-pause"
                key={playback.ready ? 'ready' : 'loading'}
                label={
                  playback.ended
                    ? 'Watch again'
                    : playback.paused
                    ? 'Play'
                    : 'Pause'
                }
                first={playback.ready && (route === 'watch' || route === 'controls')}
                disabled={!playback.ready}
                onPress={() => {
                  controls.current?.toggle();
                  setRoute('watch');
                }}
              />
              <Action
                id="moments"
                label={`Moments · ${learning.available.length}`}
                onPress={() => setRoute('moments')}
              />
              <Action
                id="saved"
                label={`Saved · ${saved.length}`}
                onPress={() => setRoute('saved')}
              />
            </View>
            {!!sequence.youtube ? <>
              <Text testID="publisher-credit" style={styles.controlHint}>
                Source: FC Barcelona · YouTube · {notice || 'Prepared learning moments'}
              </Text>
              {!!error && <Action id="youtube-fallback" label="Watch original animation"
                first onPress={switchSource} />}
            </> : <Text style={styles.controlHint}>Back to hide controls</Text>}
          </View>
        )}
      </View>
      {panel && (
        <View style={styles.panel} testID="learning-panel">
          <ScrollView
            style={styles.panelScroll}
            contentContainerStyle={styles.panelContent}
          >
            {(route === 'moments' || route === 'saved') && (
              <>
                <View style={styles.panelHeading}>
                  <Text style={styles.heading}>
                    {route === 'saved' ? 'Saved' : 'Moments'}
                  </Text>
                  <Text style={styles.count}>{rows.length}</Text>
                </View>
                {rows.length === 0 && (
                  <Text style={styles.body}>
                    {route === 'saved'
                      ? 'Save a card to revisit it here.'
                      : 'Cards appear after the action. Keep watching.'}
                  </Text>
                )}
                {rows.map((m, i) => (
                  <Action
                    key={m.id}
                    id={`open-${m.id}`}
                    label={m.title}
                    image={artwork[m.artwork]}
                    first={i === 0}
                    onPress={() =>
                      open(m.id, route === 'saved' ? 'saved' : 'moments')
                    }
                  />
                ))}
                <View style={styles.collectionTools}>
                  {route === 'moments' && (
                    <Action
                      id="collection-saved"
                      label={`Saved · ${saved.length}`}
                      compact
                      first={rows.length === 0}
                      onPress={() => setRoute('saved')}
                    />
                  )}
                  <Action
                    id="about"
                    label="Match details"
                    compact
                    onPress={() => setRoute('about')}
                  />
                </View>
              </>
            )}
            {route === 'card' && card && (
              <>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Image
                  testID="card-artwork"
                  source={artwork[card.artwork]}
                  style={styles.artwork}
                  resizeMode="contain"
                />
                <View style={styles.caption}>
                  <Text style={styles.phrase} testID="card-phrase">
                    {card.spanish}
                  </Text>
                  {learning.translated && (
                    <Text style={styles.translation} testID="card-translation">
                      {card.english}
                    </Text>
                  )}
                </View>
                <Action
                  id="meaning"
                  label={learning.translated ? 'Hide English' : 'Show English'}
                  first
                  onPress={() => {
                    learning.flip();
                    refresh();
                  }}
                />
                <View style={styles.row}>
                  <Action
                    id="save-card"
                    compact
                    label={
                      saving
                        ? 'Saving…'
                        : saved.includes(card.id)
                        ? 'Saved'
                        : 'Save'
                    }
                    disabled={saving}
                    onPress={() => {
                      void save();
                    }}
                  />
                  {saved.includes(card.id) && (
                    <Action
                      id="recall"
                      label="Practise"
                      compact
                      onPress={() => {
                        setAnswer(null);
                        setRoute('recall');
                      }}
                    />
                  )}
                </View>
                {!!storageError && (
                  <Text style={styles.small} accessibilityLiveRegion="polite">
                    {storageError}
                  </Text>
                )}
              </>
            )}
            {route === 'recall' && card && (
              <>
                <Text style={styles.heading}>Which action?</Text>
                <Image
                  source={artwork[card.artwork]}
                  style={styles.recallArtwork}
                  resizeMode="contain"
                />
                <Text style={styles.recallPhrase}>{card.spanish}</Text>
                {recallChoices(card).map((text, i) => (
                  <Action
                    key={text}
                    id={`answer-${i}`}
                    first={i === 0}
                    label={text}
                    onPress={() => setAnswer(text)}
                  />
                ))}
                {answer && (
                  <Text
                    testID="recall-feedback"
                    style={styles.body}
                    accessibilityLiveRegion="polite"
                  >
                    {answer === card.english
                      ? '¡Bien hecho!'
                      : 'Try another action.'}
                  </Text>
                )}
              </>
            )}
            {route === 'about' && (
              <>
                <Text style={styles.heading}>{sequence.title}</Text>
                <Text testID="source-details" style={styles.body}>
                  {sequence.details}
                </Text>
                <Text style={styles.body}>
                  Cards follow this recording. Saved moments stay on this TV.
                  The mobile companion is separate.
                </Text>
                <Action id="switch-source" label={sequence.youtube ? 'Watch original animation' : 'Watch Barcelona vs Madrid on YouTube'}
                  onPress={switchSource} />
                {!!storageError && (
                  <Text style={styles.small}>{storageError}</Text>
                )}
                <Action
                  id="restart"
                  label="Restart sequence"
                  first
                  disabled={!playback.ready}
                  onPress={() => {
                    controls.current?.restart();
                    setRoute('watch');
                  }}
                />
              </>
            )}
          </ScrollView>
          <View style={styles.panelFooter}>
            <Action
              id={
                route === 'card'
                  ? 'back-card'
                  : route === 'recall'
                  ? 'back-recall'
                  : route === 'about'
                  ? 'close-about'
                  : 'close-panel'
              }
              footer
              label={
                route === 'card'
                  ? origin === 'saved'
                    ? 'Back to saved'
                    : 'Back to moments'
                  : route === 'recall'
                  ? 'Back to card'
                  : 'Back to match'
              }
              first={route === 'saved' && rows.length === 0}
              onPress={() => {
                if (route === 'card') {
                  learning.close();
                  setRoute(origin);
                } else if (route === 'recall') back();
                else setRoute('watch');
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  root: {flex: 1, flexDirection: 'row', backgroundColor: '#080D20'},
  videoArea: {height: '100%', justifyContent: 'center'},
  watchTarget: {...StyleSheet.absoluteFillObject},
  watchHint: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    padding: 18,
    borderRadius: 12,
    backgroundColor: colors.cream,
  },
  title: {fontSize: 24, fontWeight: '700', color: colors.navy},
  subtitle: {fontSize: 17, color: colors.navy, marginTop: 6},
  invitation: {
    position: 'absolute',
    bottom: 28,
    right: 32,
    backgroundColor: colors.cream,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  invitationTitle: {
    fontSize: 20,
    color: colors.navy,
    fontWeight: '700',
    marginBottom: 4,
  },
  controls: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.cream,
  },
  youtubeControls: {position: 'relative', left: 0, right: 0, bottom: 0, borderRadius: 0},
  controlHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  controlTitle: {fontSize: 20, color: colors.navy, fontWeight: '700'},
  controlHint: {fontSize: 13, color: colors.navy, marginTop: 4},
  row: {flexDirection: 'row', gap: 8},
  button: {
    backgroundColor: colors.lavender,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 3,
    borderColor: 'transparent',
    marginBottom: 6,
  },
  compactButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  compactText: {fontSize: 16},
  focused: {backgroundColor: colors.blue, borderColor: colors.coral},
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.navy,
    textAlign: 'center',
  },
  panel: {width: '28%', height: '100%', backgroundColor: colors.cream},
  panelScroll: {flex: 1},
  panelContent: {padding: 16, paddingTop: 20, paddingBottom: 12},
  panelHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 12,
  },
  count: {fontSize: 18, fontWeight: '700', color: colors.navy},
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 12,
  },
  caption: {paddingVertical: 10},
  phrase: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.navy,
  },
  translation: {
    fontSize: 17,
    lineHeight: 22,
    color: colors.blue,
    marginTop: 8,
  },
  recallPhrase: {
    fontSize: 20,
    lineHeight: 26,
    color: colors.navy,
    marginVertical: 12,
    fontWeight: '700',
  },
  body: {fontSize: 18, lineHeight: 25, color: colors.navy, marginBottom: 16},
  small: {fontSize: 14, color: colors.navy},
  artwork: {
    width: '100%',
    height: 136,
    borderRadius: 6,
    backgroundColor: colors.lavender,
  },
  recallArtwork: {width: '100%', height: 90, borderRadius: 6},
  thumbnail: {width: 82, height: 56, borderRadius: 6},
  momentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 5,
    paddingVertical: 7,
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  momentText: {flex: 1, fontSize: 17, lineHeight: 22, textAlign: 'left'},
  collectionTools: {
    borderTopWidth: 1,
    borderTopColor: '#D9D3DF',
    marginTop: 12,
    paddingTop: 8,
  },
  panelFooter: {backgroundColor: colors.navy, padding: 4},
  footerButton: {
    backgroundColor: colors.navy,
    marginBottom: 0,
    borderRadius: 6,
    paddingVertical: 9,
  },
  error: {
    position: 'absolute',
    left: 40,
    right: 40,
    backgroundColor: colors.cream,
    padding: 24,
    borderRadius: 12,
  },
});
