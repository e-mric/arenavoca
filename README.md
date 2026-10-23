# ArenaVoca for Fire TV

ArenaVoca helps football fans practise Spanish while they watch a match. The video
fills the screen; when something happens on the pitch, a learning moment becomes
available. With the remote you can open an illustrated Spanish card, reveal the
English, save the phrase and try a short recall question. Opening a card never
pauses or seeks the match.

This branch is the **Amazon Build, Ship, Shape (Fire TV track)** entry. It contains
only the Vega (Fire TV OS) app. The wider project — Quest 3 VR, the Android/iOS
companion, Android TV and match-recognition experiments — lives on the
[`full-project`](https://github.com/e-mric/arenavoca/tree/full-project) branch.

Judges: see [SUBMISSION.md](SUBMISSION.md) for the walkthrough and limits.

## Try it (prebuilt package)

Requires Amazon's [Vega SDK](https://developer.amazon.com/docs/vega/latest/overview.html)
and its virtual device (verified with CLI 1.4.5 / SDK 0.24.12112, aarch64 1080p).

```bash
source ~/vega/env
vega virtual-device start --timeout 120
vega run-app app/native/vegaTV/prebuilt/arenavoca-vega-aarch64-release.vpkg \
  com.arenavoca.tv.main -d VirtualDevice
```

Press Select to show the controls, choose Play, and open **Moments** once the first
moment appears (6 s). Back returns to the match.

## Build from source

Needs the Vega SDK, access to its dependency registry, and `ffmpeg` on PATH.

```bash
source ~/vega/env
cd app/native/vegaTV
vega exec npm ci
vega exec npm run prepare:content
vega exec npm run typecheck
vega exec npm run build:release
vega run-app build/aarch64-release/arenavocatv_aarch64.vpkg \
  com.arenavoca.tv.main -d VirtualDevice
```

The build stages the match clip and card artwork, packages the app and checks
that the package holds exactly the expected video and images (SHA-256).
`npm run build:youtube` builds an experimental variant that streams the same moment
from YouTube instead (see limits below).

Unit tests (timing, saves, playback rules) run from the repository root:

```bash
npm ci
npm test
```

The remote-control journey on the simulator (Appium) is described in the
[Vega guide](app/src/features/tv-learning/vega/README.md#automated-and-simulator-checks).

## Where things are

| Path | Contents |
| --- | --- |
| `app/src/features/tv-learning/vega/` | App behaviour, tests, the match clip and the [detailed guide](app/src/features/tv-learning/vega/README.md) |
| `app/native/vegaTV/` | Vega package manifest, build/verification scripts, prebuilt `.vpkg` |
| `app/src/features/stories/` | Card text (`content/barca-2018-opening.json`) and card artwork |
| `docs/submission/` | Devpost story, demo-video storyboard and narration |

## Media and credits

The app bundles a 36-second cut (recording 13:28–14:04) of *Barcelona 5–1 Madrid,
28 October 2018*, from FC Barcelona's official YouTube upload
[`WMjohb2tq7Y`](https://youtu.be/WMjohb2tq7Y); the app credits it in Match details.
The full match is not in this repository. The card illustrations were generated
for ArenaVoca from text descriptions, without broadcast frames; prompts are kept in
[the artwork record](app/src/features/stories/artwork/comic/README.md). Including the clip is the project owner's choice for
this prototype; it does not establish publication rights.

## Current limits

- Prepared cards for one sequence; no live event detection yet.
- Spanish text awaits review by a fluent speaker.
- Verified on the official Vega simulator only; physical Fire TV, 720p and
  screen-reader use are untested.
- YouTube streaming stalls after a few seconds inside the simulator's WebView,
  for any video, so the release plays the bundled clip.

## Roadmap

- **Phone companion sync** — send saved TV moments to the ArenaVoca mobile app
  (an Android/iOS prototype with comic recaps and practice exists on `full-project`)
  for spaced review after the match.
- **VR on Quest 3** — the same match moments on a large virtual screen with
  hand-tracked cards; a WebXR prototype exists on `full-project` and targets the
  Meta Horizon Start competition.
- **Automatic moments** — detect passes, shots and goals from the broadcast
  instead of preparing them by hand (local AI experiments are on `full-project`).
- **Streaming sources** — play matches from licensed streams or YouTube on real
  Fire TV hardware, with the cards following that stream's clock.
- **More matches and sports** — a library of sequences, then other sports
  (Formula 1 vocabulary exists as a practice pack).
- **On-TV recap** — the illustrated comic recap of the match, already on mobile.
- **Quality** — fluent Spanish review, audio pronunciation, accessibility and
  testing on Fire TV devices.
