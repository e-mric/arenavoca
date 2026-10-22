# Fire TV learning cards

Reviewed: 2026-10-22.

The [Vega adaptation](vega/README.md) is now available as a separate React Native
application with actual VVD playback/card checks. The Android sections below
retain their own platform scope.

The separate `:tvApp` Android target keeps the existing `:androidApp` phone
companion and iOS app. Watch one football sequence, use the remote to open three
source-matched cards, reveal English, save locally and answer a recall question
for each saved card. No character, celebration gesture or runtime AI is involved.

The current-match rule is explicit: a `TvSequence` supplies both the media resource
and its card pack. Its playback position unlocks cards only after each source
window ends. Opening, flipping, saving and practising never command the player.
An open card stays pinned while later moments become available. Back closes the
learning view and restores focus to full-screen watching. Play/Pause and Watch again are explicit
playback actions. Leaving the activity pauses and saves the position per sequence; reopening restores that position paused and needs explicit Play.

## Match-first interface

The video occupies the full screen by default, retaining its aspect ratio. Initial
playback is paused: Select reveals controls and Play explicitly starts it.
D-pad/Select from watching opens a compact controls bar. Moments, Saved and About
are explicit destinations; arrivals never open a card or steal focus. A new-moment
invitation fades after five seconds. An open card keeps 72% of screen width for
the video and uses a scrollable cream panel for artwork, a single language,
Meaning and Save. Back restores full-screen watching. Save writes run off the UI
thread with success/failure feedback. Review/source details stay under About.

The Android phone retains the original home requested by the user. Inside its
actual-match collection, select an illustrated moment, reveal Meaning, save
locally, open evidence or replay, and practise the story. The collection opens directly without a spoiler-confirmation screen.
Saved phone cards have their own local collection; they do not sync TV saves.

## Optional Alba comic · 21 October

The Alba build also offers Comic in the controls bar. Three prepared manhwa panels
unlock from the same playback windows below; the original-media variant does not
offer this route. Hold Select on Spanish for English, release to hide; accessible
activation toggles the translation. Previous/Next skip unavailable panels, and
selection stays pinned while playback advances. Back preserves playback state.
The phone has a continuous scrollable recap and an independent,
optional vocabulary warm-up. [Interaction, assets and checks](../stories/COMIC.md).

## Match content

The local Alba build plays recording seconds **808–844** from the user's
downloaded Barcelona–Madrid game. It reuses `MatchCatalog` from the mobile
companion, with clip time = source recording time minus 808 seconds:

| Card | Source window ends | Available in excerpt |
| --- | --- | --- |
| Jordi Alba corre al espacio. | 814 s | 6 s |
| Alba pasa el balón hacia atrás. | 817 s | 9 s |
| Coutinho marca el primer gol. | 822 s | 14 s |

These are prepared cards from the existing transcript/frame review, not newly
detected events. Spanish awaits fluent review. Broadcast match-clock labels differ
from recording positions. Saved cards are namespaced by sequence and persist on
the TV; they cannot unlock another recording's cards.

The default clean-checkout/release build uses an original 36-second Blue/Amber
tactical animation, with pass, shot and goalkeeper-save cards at 8, 20 and 28
seconds. The source script is [render_sequence.py](authoring/render_sequence.py)
(Pillow + ffmpeg; Arial Bold on macOS, Pillow fallback elsewhere). It creates
`res/raw/tv_football.mp4` and the TV banner without storing frame sequences.
The animation and banner contain original geometry/layout and no broadcast media.
Card illustrations retain their existing recap/stories provenance.

## Build and run

Use the existing JDK 17 / Android SDK 36 setup in the root README. From
`app/native/`:

```sh
./gradlew :shared:jvmTest :tvApp:assembleDebug :androidApp:assembleDebug
./gradlew :tvApp:connectedDebugAndroidTest
```

Connect only the intended Android TV emulator for the TV instrumentation task.
The local test AVD is `arenavoca-tv`, Android TV API 34, arm64, 1080p.
The app requires API 29+: Fire OS 7/API 28 is excluded. Android TV emulation is
not physical Fire TV or Vega OS acceptance.

For the private match variant, first create the ignored resource from the
repository root:

```sh
mkdir -p app/native/local-media/tv/res/raw
ffmpeg -nostdin -y -ss 808 -i app/public/media/user/barca-2018-h264.mp4 \
  -t 36 -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 96k \
  -movflags +faststart app/native/local-media/tv/res/raw/tv_alba.mp4
cd app/native
./gradlew :tvApp:assembleDebug :tvApp:connectedDebugAndroidTest -PtvAlba=true
```

`tvAlba=true` adds only `local-media/tv/res` to **debug**, and selects that excerpt
when its resource exists. Release never includes that directory. The source file
must be the existing 5961-second recording identified in
`stories/content/barca-2018-opening.json`; replacing the media without replacing
the timestamps/cards produces invalid learning content.

Install the APK with `android run --device <emulator-serial> --apks
tvApp/build/outputs/apk/debug/tvApp-debug.apk --activity com.arenavoca.tv.TvActivity`.
Use the emulator D-pad, Enter/Select, Back and media Play/Pause. An explicit
debug intent extra `--es sequence demo` selects the original animation in a local
Alba build.

Do not publish the private APK, recording, or screenshots/video containing the
broadcast without clearing their use. A downloaded copy alone does not establish
public reuse permission.

## Verification and limits

The later match-first refinement passed the remote journey again for both media
variants and all 11 phone instrumentation tests. It asserts full-screen video
geometry, 72% width and retained aspect ratio beside an explicitly opened card,
arrival without focus theft, and return to full screen. Phone tests cover
one-language disclosure and local match-card persistence in addition to existing
replay/story/recap/import journeys. The original phone home is retained per the
user's screenshot. Actual 1080p TV and phone captures, plus the checked 1.3-font
TV card, are in ignored `app/content-source/match-analysis/design-implementation/`.
The original font setting was restored. Release media isolation was rechecked.


On 20 October, 33 shared JVM tests passed. The real-player remote journey passed
on Android TV API 34 for both the local Alba and original-media builds. Debug
TV/mobile APKs and the unsigned TV release APK built successfully. The release's
only MP4 matched the checked-in original animation by SHA-256; the private clip
was absent. The downloaded source hash matched the match pack and the extracted
clip measured exactly 36 seconds.

All 10 existing phone instrumentation tests also passed on the API 36 Pixel 7
emulator (`betherecentral-demo`), including recap, import, stories and match
moments/replay. The unchanged web/XR and iOS UI suites were not rerun for this
native TV addition.

An actual emulator capture with the cutback card selected and the broadcast still
playing is retained locally at
`app/content-source/match-analysis/fire-tv/alba-card.png`. It and copied test XML
are ignored because this evidence includes private broadcast material.

Shared tests cover source-time boundaries, selected-card pinning, rewind behavior,
source isolation, saved-card reopening and recall using the selected match's
vocabulary. `TvJourneyTest` uses real remote key events and the real bundled video:
unlock → flip → save → later card → pause preserved → recap → restart activity →
reopen saved content without starting playback. The same journey accepts either
sequence rather than substituting a mocked player.

The phone keeps its current practice and actual-match collection; its former home import controls are removed. This TV slice does not export/sync its new saved-card collection. There is
no live inference, third-party-player overlay, microphone, pronunciation audio,
arbitrary-video picker or full-game card coverage.
The AI/vision experiments remain in `match-recognition`; they are not wired into
the TV player. Physical Fire TV remote/performance, fluent Spanish review and
public submission rights remain separate checks.

Platform references: [Compose for TV](https://developer.android.com/training/tv/playback/compose),
[TV controllers](https://developer.android.com/training/tv/get-started/controllers),
[Fire OS overview](https://developer.amazon.com/docs/fire-tv/fire-os-overview.html).

## Independent replay and remaining gaps · 21 October

Cards and comic panels now offer Replay moment. A separate muted player shows
only the selected source window in the side panel, without requesting audio
focus or commanding the main match. The remote controls pause/repeat and Back
returns to the selected learning item. Playback position persists per sequence
across activity recreation and cold launch; reopening requires explicit Play.

The user has no Fire TV hardware and chose emulator testing, dropping the
planned event demo in favour of Amazon Build, Ship, Shape and Meta VR Start.
Amazon submission readiness remains the immediate TV priority; broader feature
expansion is deferred. Its required Fire TV/Vega simulator evidence is not yet
established by our generic Android TV emulator checks. The main remaining gaps are phone pairing/save sync,
reviewed full-match card delivery from the analysis pipeline, and physical Fire
TV compatibility/performance. These are not prerequisites for keeping the current
emulator prototype usable. API 29 remains the minimum; no Vega port is claimed.

The Alba debug build passes the API 34 card/save/recreation journey, comic journey,
and independent replay/cold-launch journey. Replay is checked against its source
range, with main playback continuing while the replay pauses; explicit main pause
also survives closing the replay. The shared suite has 39 passing tests. Actual
captures are in ignored `app/content-source/match-analysis/stadium-replay/`.
Original-media UI and release packaging were not rerun in this bounded iteration;
previous results above remain dated evidence, not new acceptance.

## Vega simulator setup attempt · 21 October

Updated 22 October: the storage constraint is resolved. The user freed space,
leaving 37 GiB at preflight. Vega CLI **1.4.5**, SDK **0.24.12112**, Rosetta and
the documented Homebrew prerequisites are installed on this Apple Silicon Mac.
The bootstrapper added `source ~/vega/env` to `.zshrc`. No user files were removed.

The aarch64 Vega Virtual Device boots at **1920×1080**. Amazon's unmodified
`helloWorld` React Native starter was generated in `/tmp/arenavoca-vega-smoke`,
built as Release, installed and launched as `com.arenavoca.vegasmoke.main`.
Appium **2.2.2** with Vega driver **3.30.0** verified right-arrow focus to Get
started, Select opening its content, then left/Select returning Home. Actual
screenshots, UI trees and the result are in ignored
`app/content-source/match-analysis/vega-simulator/`. The simulator is left running.
This establishes starter execution, not ArenaVoca playback or submission acceptance.

Reproduce the starter check (generation requires a new output directory):

```bash
source ~/vega/env
vega sdk list-installed --json
vega virtual-device start --timeout 120
vega project generate --template helloWorld --name ArenaVocaVegaSmoke \
  --packageId com.arenavoca.vegasmoke --outputDir /tmp/arenavoca-vega-smoke
cd /tmp/arenavoca-vega-smoke
vega exec npm install
vega exec npx react-native build-vega --build-type Release --target aarch64 --max-workers 4
vega run-app build/private/kepler/@amazon-devices/arenavocavegasmoke/undefined/vega/aarch64/Release/@amazon-devices/arenavocavegasmoke_aarch64.vpkg \
  com.arenavoca.vegasmoke.main -d VirtualDevice
vega device is-app-running -d VirtualDevice -a com.arenavoca.vegasmoke.main
```

For screenshots and remote automation, Appium and Node 22 were installed in
`/tmp/arenavoca-vega-appium` with a separate `APPIUM_HOME` there, leaving other
Appium installations untouched. The test server used localhost port 4725 and
was stopped afterward. Enable the toolkit on the selected virtual device with
`vega exec vda -s <serial> shell 'touch /tmp/automation-toolkit.enable'`.
Use the serial returned by `vega exec vda devices` (this run: `emulator-5558`),
not `default`: VDA also listed both Android emulators. Capture through Appium's
screenshot command; the device `gwsi-tool-screenshooter` is unsupported on VVD.
The raw WebDriver execute payload for this driver uses nested arguments:
`{"script":"jsonrpc: injectInputKeyEvent","args":[[{"inputKeyEvent":"106","holdDuration":100}]]}`.
A flat argument list returned INVALID_PARAMS; the nested form passed the journey.

**Follow-up, 22 October:** the bounded ArenaVoca port is implemented and tested
on the same official simulator, including real playback, timed cards,
translation, local saves and recall. See the [Vega guide](vega/README.md) for
build commands, reproducible remote journeys, packaging findings and remaining
limits. The starter evidence above remains the earlier toolchain check.

Sources: [installation](https://developer.amazon.com/docs/vega/0.24/install-vega-sdk),
[virtual device](https://developer.amazon.com/docs/vega/0.24/run-apps),
[starter app](https://developer.amazon.com/docs/vega/0.24/hello-world),
[Appium setup](https://developer.amazon.com/docs/vega/0.24/appium-install),
[Appium commands](https://developer.amazon.com/docs/vega/0.24/appium-commands).
