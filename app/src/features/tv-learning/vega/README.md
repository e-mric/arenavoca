# ArenaVoca on Vega

Reviewed: 2026-10-22. This is a separate React Native/Kepler application, not the
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

Release always stages the original Blue/Amber animation and its pass/shot/save
cards (8/20/28 seconds). The animation is authored by [render_sequence.py](../authoring/render_sequence.py)
using Pillow and FFmpeg, with fictional Blue/Amber teams and no external footage.
The macOS Arial Bold font is rendered, not redistributed; other hosts use the
Pillow fallback. The card PNGs reuse the tracked original
[recap SVG artwork and renderer](../../recap/artwork/render-actions.mjs). The build verifies that its package
contains exactly one video, its derived final frame and the expected artwork,
matching staged SHA-256 hashes. Generated content, dependencies and packages stay ignored.

An optional `npm run build:alba` Debug variant is retained for local research. It
requires private `app/native/local-media/tv/res/raw/tv_alba.mp4` and the additional
`comic_alba_run`, `comic_alba_cutback`, and `comic_alba_goal` PNGs under the stories
artwork directory. These local inputs are not part of this submission. It is not
a clean-checkout command or cleared public demonstration. The build wrapper
restores original staging even after a failure. Do not run two builds in this
directory concurrently; use the npm wrapper rather than packaging staged files.

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
  --pack original --device emulator-5558 \
  --output app/content-source/match-analysis/vega-simulator
vega device terminate-app -d VirtualDevice -a com.arenavoca.tv.main
vega device launch-app -d VirtualDevice -a com.arenavoca.tv.main
python3 app/src/features/tv-learning/vega/tests/simulator.py \
  --pack original --device emulator-5558 --cold-launch \
  --output app/content-source/match-analysis/vega-simulator
```

Use a Python environment with Pillow installed for the rendered-pixel regression.
Local researchers with the optional private inputs can repeat with `--pack alba`. Results and
screenshots stay in the ignored output folder. The driver takes nested arguments
for `jsonrpc: injectInputKeyEvent`; the checked-in journey preserves that shape.

The journey checks remote reachability, full-screen/panel dimensions, gated
cards, no automatic opening, pinned English while playback advances, save,
correct/incorrect recall, explicit pause, saved access after rewind, all three
source-matched cards, hardware Play/Pause and Back. Cold-launch mode checks
persisted position, no autoplay and both saved cards after process termination.

Verified 22 October: both complete media journeys and both cold-launch checks
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
