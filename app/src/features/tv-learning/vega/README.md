# ArenaVoca on Vega

Reviewed: 2026-10-23. This is a separate React Native/Kepler application, not the
Android APK. Build scaffolding lives in `app/native/vegaTV`; behavior lives here.
The Android phone, Android TV and XR implementations remain separate.

## Scope

Watch one 36-second football sequence, then explicitly open its three timed
learning cards. Spanish/English, local Save, Saved moments and a short recall
question work with D-pad/Select/Back. The illustrated Moments list uses compact rows;
English appears below the Spanish on request. Return controls stay in a fixed footer.
The main bar contains only Play/Pause, Moments and Saved; restart lives in Match details. The video fills the default view; an open
panel leaves 72% width for an uncropped 16:9 video. Hardware Play/Pause and the
on-screen playback controls are explicit playback choices. Back from a card
returns to full-screen watching; its collection button returns to its list.

The player owns time. Learning cannot seek, pause, mute or resume it, and later
arrivals cannot replace a selected card. Saved IDs and playback position are
namespaced per sequence in local AsyncStorage. Reopening restores paused.
There is no phone sync, live detection, comic or independent replay in this
bounded Vega version. Those Android features have not been ported here.

## YouTube candidate — 23 October verification

The user authorized a separate native Vega YouTube experiment for Barcelona–Madrid,
using FC Barcelona's official upload (`WMjohb2tq7Y`) and prepared cards for recording
808–844 seconds. This does not restore the retired web/XR streaming route.
`npm run build:youtube` creates the opt-in candidate; `build:release` builds the
local-cut default. Since 23 October both builds bundle the tracked 36-second cut as
the local fallback; neither bundles the full match.

For simulator development, keep `vega exec npm run player:serve` running in another
terminal. It serves only the HTML wrapper at `http://127.0.0.1:8766`; the VVD reaches
it at `http://10.0.2.2:8766`. All match video/audio comes from YouTube. For a standalone
installation, host the generated `generated/youtube-player/index.html` on HTTPS and
set `ARENAVOCA_YOUTUBE_PLAYER_URL` during the build. That hosting is not deployed.
Use the SDK's bundled Node runtime for content preparation.

At commit `4a8dbf0`, the WebView module and audio-system service declarations are
present. A fresh 23 October release build and native typecheck pass; all 15 Vega
pure tests pass. Actual YouTube playback on the official 1080p VVD still stalls
buffering at source time 808 (and sometimes 0), so the three-card YouTube journey
does **not** pass. Native/on-screen pause also failed to produce a paused callback
during the stall. Enabling default WebView media controls and warming playback at
zero before seeking did not resolve it; those trials were reverted. These results
supersede any assumption that the permission fix establishes YouTube acceptance.

**Root-cause probe, 23 October:** a diagnostic page served in place of the wrapper,
inside the same installed app, isolated the stall from ArenaVoca's code. The Vega
WebView (Chrome 144) plays progressive H.264, MediaSource VP9/H.264 video and AAC/Opus
audio. YouTube's own IFrame API sample (`M7lc1UVf-VE`) also plays about three
seconds, then buffers indefinitely, with every YouTube media host reachable. Device
logs show YouTube repeatedly stopping and flushing an otherwise configured 720p VP9
platform decoder. The failure therefore lies in YouTube streaming in this
simulator's WebView, not in seek timing or the cards. No code change in this
repository is expected to fix it. Separately, the first one or two MediaSource H.264
pipelines in a fresh WebView sometimes freeze at 0.19 seconds; a tiny warm-up clip
avoided that, but did not help YouTube.

The same day's **local Alba** Debug build advances normally. Its remote journey
passed card gating, pinned English, saves, recall, EOF pixels and Watch again,
then failed the final hardware-pause assertion after restart (3.1 → 11.9 seconds
despite the key). Do not report that entire journey as passed. A separate focused
check passed on-screen pause, cold launch at exactly 3.8 seconds paused, both saved
cards and translation without resuming. Local evidence is under ignored
`app/content-source/match-analysis/alba-verify-2026-10-23/`. Physical devices remain
untested, and the Alba clip is still private local media.

Reproduce with the `build:youtube` candidate installed, the wrapper server running,
and the emulator automation toolkit enabled:

```bash
python3 app/src/features/tv-learning/vega/tests/simulator.py \
  --pack youtube --device emulator-5554 \
  --output app/content-source/match-analysis/youtube-vega-2026-10-23
```

Use the actual VVD serial from `vega exec vda devices`. Evidence stays in the ignored
output folder. Further work must establish advancing video pixels and clock,
timed cards, remote pause and paused restoration before promoting this candidate.

## Build

Install Amazon's Vega SDK and macOS prerequisites using the linked instructions
on [Amazon’s Vega documentation](https://developer.amazon.com/docs/vega/latest/overview.html).
Content preparation also requires `ffmpeg` on PATH to extract the source clip’s final
frame for the end-of-playback display. The verified toolchain is CLI 1.4.5 / SDK 0.24.12112, with an aarch64 1080p VVD.
From the repository root:

```bash
source ~/vega/env
cd app/native/vegaTV
vega exec npm ci
vega exec npm run prepare:content
vega exec npm run typecheck
vega exec npm run build:release
vega virtual-device start --timeout 120
vega run-app build/aarch64-release/arenavocatv_aarch64.vpkg \
  com.arenavoca.tv.main -d VirtualDevice
```

Release stages the tracked 36-second Barcelona–Madrid cut
[`media/barca-2018-alba.mp4`](media/barca-2018-alba.mp4) (recording 808–844 s of FC
Barcelona's official upload) with the run, cutback and goal cards (6/9/14 seconds)
and their tracked comic artwork. The user decided on 23 October to drop the
Blue/Amber animation from Vega and keep this cut in Git; the full match stays out.
[Provenance](../../../../content-source/asset-provenance.md). The build verifies
that its package contains exactly one video, its derived final frame and the
expected artwork, matching staged SHA-256 hashes. Generated content, dependencies
and packages stay ignored. Judges receive the demo video and a prebuilt `.vpkg`;
a clean checkout can also build it with the commands above.

`npm run build:youtube` builds the opt-in YouTube candidate (see above); it is the
only build that shows the YouTube source switch. `--debug` builds a Debug package
of either variant. Do not run two builds in this directory concurrently; use the
npm wrapper rather than packaging staged files.

## Automated and simulator checks

For the bounded pure tests, run `cd app && npm ci && npx vitest run src/features/tv-learning/vega`.
The broader `cd app && npm run check` covers the pure timing/storage/source tests, web
TypeScript and the existing web production build. Native TSX additionally needs
the Vega `typecheck` above. The simulator journey uses the actual media player,
UI tree and remote key events, without overriding the video clock.

Appium 2.2.2 with `@amazon-devices/appium-kepler-driver@3.30.0` and Node 22 was
used on localhost port 4725. Set `APPIUM_HOME` to an isolated installation and
ensure the SDK's VDA runtime is on PATH. Follow Amazon's
[Appium setup](https://developer.amazon.com/docs/vega/0.24/appium-install).
Use the explicit VVD serial from `vega exec vda devices`; Android emulators may
also appear. From the repository root, after launching ArenaVoca:

```bash
vega exec vda -s emulator-5558 shell 'touch /tmp/automation-toolkit.enable'
python3 app/src/features/tv-learning/vega/tests/simulator.py \
  --pack alba --device emulator-5558 \
  --output app/content-source/match-analysis/vega-simulator
vega device terminate-app -d VirtualDevice -a com.arenavoca.tv.main
vega device launch-app -d VirtualDevice -a com.arenavoca.tv.main
python3 app/src/features/tv-learning/vega/tests/simulator.py \
  --pack alba --device emulator-5558 --cold-launch \
  --output app/content-source/match-analysis/vega-simulator
```

Use a Python environment with Pillow installed for the end-frame pixel check.
`--pack alba` is the release build; `--pack youtube` is the candidate. Results and
screenshots stay in the ignored output folder. The driver takes nested arguments
for `jsonrpc: injectInputKeyEvent`; the checked-in journey preserves that shape.

The journey checks remote reachability, full-screen/panel dimensions, gated
cards, no automatic opening, pinned English while playback advances, save,
correct/incorrect recall, explicit pause, saved access after rewind, all three
source-matched cards, hardware Play/Pause and Back. Cold-launch mode checks
persisted position, no autoplay and both saved cards after process termination.

**Barcelona release and remote pause, 23 October:** the remote's Play/Pause key
arrives as `play`, which Vega's built-in player session handles only while its
state is current. After Restart or Watch again its state could lag, so the key was
silently dropped (the earlier final hardware-pause failure). The app now waits
400 ms after any Play/Pause key and toggles only if the session did not act
(`toggleUnlessHandled`, unit-tested). The Blue/Amber-only paused-pixel check was
removed with that pack. The release build, native typecheck, 18 Vega pure tests and
package hashes pass; two consecutive complete release journeys and the paused
cold-launch check (3.8 s, both saves) pass on the official 1080p VVD. Evidence:
ignored `app/content-source/match-analysis/vega-release-barca-2026-10-23/`.
Physical Fire TV remains untested.

Verified 22 October (historical, before Blue/Amber was removed): both complete media journeys and both cold-launch checks
pass on the official aarch64 1080p VVD. Native typecheck, both package builds and
asset hashes pass; `npm run check` passes 321 tests in 56 files, typecheck and
production build (existing bundle-size warning). Final captures are
`original-card-english.png`, `alba-card-english.png` and each pack's
`*-restored-card.png` in the ignored evidence folder above.

## Visual refinement — 22 October

The user approved the Watch / Moments / Learn refinement.
The implemented layout retains full-screen watching and a 28% cream learning panel,
uses matching comic artwork for Alba, and keeps Spanish visible while English is
shown underneath. A transient new-moment invitation opens Moments with Select;
learning remains optional. The footer stays visible after Save and during recall.

Actual capture gallery: `app/content-source/match-analysis/vega-design-implemented-2026-10-22/index.html`.
These captures are emulator output, separate from generated proposal pixels.
Both updated Alba Debug and original-media Release journeys and paused cold-launch
checks passed on the official 1080p VVD. The checks additionally cover fixed return
controls, Spanish retained beneath/above translation, bounded artwork, actual
full-screen end pixels and Watch again. Both builds, native typecheck and package
hash checks passed. The app check passed 321 tests, typecheck and production build
with the existing bundle-size warning. Physical hardware and 720p remain untested.

## Integration findings

- At EOF the SDK can retain a smaller frozen native frame after the panel closes.
  A source-derived final-frame image covers the still-mounted surface only when
  `player.ended` is true and scales with the video area. It disappears on restart.
  This does not seek, resume or replace the playing source. The simulator regression
  compares full-screen pixels before/after panel closure and checks both outer edges;
  wrapper dimensions alone missed this bug. Package hashes cover the final frame.
- Vega's image layout expanded artwork to its intrinsic dimensions with only an
  aspect ratio. Explicit bounded artwork height keeps card actions visible.
- Vega packaging skips hidden asset directories. Staging uses `generated/`, not
  `.generated/`; the package-content assertion prevents a recurrence.
- Metro resolves the bundled video as `file:///pkg/...`. This local media player
  expects `/pkg/...`; `mediaSource` converts that path and leaves remote URLs
  untouched. A regression test covers both forms.
- The Kepler remote event is `playpause` (lowercase), as declared in its TV types.
- Reset Metro cache during packaging because the feature sources live outside
  the native build directory. The build wrapper supplies this flag.
- W3C media 2.3.2's unused `SliderMetaData` control has a one-argument
  `forwardRef` callback. Direct imports of its published player/surface modules
  avoid evaluating those unused controls, eliminating that debug warning.
- Kepler 4's debug overlay eagerly checks Android's `RCTSafeAreaView` even on
  Vega and falls back to `View`. `index.js` filters only that exact known warning
  in development, plus the SDK’s informational debug-build and open-debugger notices; this is a scoped SDK workaround, not an upstream fix. Warning details remain in the debugger (the SDK uses Fusebox); actual errors
  remain visible on screen. No global LogBox disabling is used. Remove the filter when the SDK fixes the
  probe. The simulator journey asserts no warning overlay covers the app.
- Image-loader fallback warnings were present in SDK logs; actual artwork
  loaded and appears in the checked captures. They are not suppressed.

Physical Fire TV/Vega, accessibility-reader usability, 720p, performance/endurance,
fluent Spanish review and store/submission acceptance remain unverified. Prepared
cards are not evidence of live AI accuracy. Simulator screenshots are product
execution evidence; a public submission video still needs to be recorded.
