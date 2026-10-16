# First prototype implementation evidence

12 October 2026 · Milestone A implementation prepared; actual Quest review pending.

## Immersive full-match update

The user corrected the browser-window approach and requested a real sports theater plus passthrough. The primary entry now launches immersive VR for **Theater**, or immersive AR for **My room** using `World.launchXR` per-launch session overrides. A procedural dark lounge surrounds a 7.2 × 4.05 m video screen. World-space practice panels use team colours and deliberate placement presets; AR removes the room and clears the background to alpha zero. No room scanning or real-object occlusion is implemented.

The user supplied the Barça 2018 full match locally. Its AV1 recording was converted to H264/AAC, 1280×720 at 25 fps, 5960.79 seconds. The native `HTMLVideoElement` streams it into a Three VideoTexture without loading the entire recording into a Blob. Both user media files stay local/ignored. Manual football/F1 concept packs are separate from real event timings; the full recording keeps source audio and has on-demand Spanish phrase pronunciation, without claiming a full alternate commentary track or automatic chants.

Measured emulator evidence: trusted page selection launches `immersive-vr` and `immersive-ar`; ECS reports the lounge visible in VR and hidden in AR. Actual controller-ray Start plays the full match; Explore reports MATCH PLAYING; Replay unfolds all three phrase chunks. The production full-match browser journey verifies >5900-second duration, direct video source, continuous playback through Explore/Replay/Save/Back and correct paused behavior. F1 behavior uses a clearly labelled test fixture, not a real race. [Theater capture](../app/artifacts/immersive-theater.png) and [AR emulator capture](../app/artifacts/passthrough-emulator.png) are browser emulation, not physical headset evidence.

Physical Quest 3: USB was previously connected and the browser page was user-confirmed visible. The updated root route was opened over USB. The user then confirmed that My room shows the real room and floating screen on the physical Quest 3. Sustained playback, hands-only interaction, comfort/performance and upcoming glasses hardware remain unverified. Optional gaze tracking is enabled; glasses field-of-view masking is unavailable in the installed SDK schema. The original 30-second calibration remains reachable with `?sample=1`.

## Delivered

- Official TypeScript IWSDK 1.0.1 scaffold in `app/`, reorganized into feature folders with colocated unit tests.
- Original 30-second, 720p, 30 fps Blender passing clip, with prepared English commentary mixed into the video. Match video is 512,507 bytes.
- One validated Spanish phrase and a diagram derived from the same passing endpoints.
- A replay prompt window at 12–20 s; captions and prompts read the video position, with no independent match timer.
- Explore and the phrase library keep the match playing at normal brightness. Closing never seeks or resumes; explicit Pause/Play work in the companion. The chosen explanation stays pinned after prompt expiry and full time.
- World-space left/right, near/far, and low/high companion presets with local persistence and backward-compatible progress migration. Free dragging is not implemented.
- Pre-match Blue/Amber/neutral preference, opt-in original text-only chant timing at 21–27 s, highlighted words, translation, and Hide lyrics. No supporter audio, singing capture, live recognition, or real-song alignment is implemented.
- Deliberately armed tracing, selected left/right hand, continuous corridor, tracking/depth freeze, progressive sentence chunks, and a complete Replay alternative.
- Preloaded, explicitly requested Spanish pronunciation through Web Audio, non-overlapping restart, explicit Stop, and commentary ducking that respects mute.
- Durable Save with no duplicate entries; invalid or unavailable storage recovery; resumable position/seen events/preferences; Your phrases; restart preservation.
- Browser preview plus world-space UIKitML controls and Three.js video/diagram surfaces. Required hand-tracking feature; no locomotion or controller-only dependency.
- HTTPS development route and USB loopback route to the production build. No publication or deployment performed.
- Three fictional personas with concrete experience and verification scenarios.
- Original team-inspired football and F1 themes across browser and spatial panels; sport/team choice persists. The immersive sample remains original football; the separate browser-window route now has real publisher-hosted sources.
- English-first commentary with optional Spanish speech/captions. The alternate 30-second audio preloads locally, aligns to the same video position, respects mute/ducking, cancels stale play commands and falls back to English on failure.

## Automated evidence

`npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e` pass. There are **141 unit tests in twenty-one files** and **twenty-one production browser journeys**. Future features must include tests as requested by the user.

| Feature | Evidence |
| --- | --- |
| Content | IDs, references, safe paths, interval bounds, eight-second limit, overlap, normalized positions, accents, nested deployment base |
| Playback | Complete Blob preload, decoding failure, empty/failed assets, authoritative boundaries, caption timing, exposure deduplication |
| Learning | Deliberate arming, start requirement, corridor tolerance, no teleporting, monotonic progress, tracking/depth freeze, chunk reveal, multi-segment mapping |
| Team theme | Compatible sport/team choices, persisted identity, distinct football/F1 geometry, primary and secondary text contrast across seven palettes |
| Audio | No autoplay, repeated Listen without overlap, ended/Stop restoration, mute preservation, delayed-resume cancellation, load failure; Spanish timeline alignment, rapid switching, pause/finish cancellation, failed alternate track |
| Progress | Save deduplication/reopening, corruption/version mismatch, access denial, quota errors, resumable state |
| Session | Ignored completion, uninterrupted Explore/library, optional pause, pinned expiry/full time, restart preservation, suspension/resume, autoplay rejection, delayed play race, card expiration |
| Coordinator | Replay retains complete phrase, trace selection/reset, stale pronunciation cancellation, mute changes during playback |
| Karaoke | Team filtering, opt-in/neutral behavior, authoritative cue/word boundaries, no cues for unrelated content, pre-match preference persistence |
| XR | Required hand-tracking, no locomotion, in-world controls/hand ray components and local font bindings, placement projection separation; active emulated immersive session observed |
| Browser journeys | Watch → trace/listen/save/back/reopen, Replay, ignored muted offline completion, failed Save, media/audio recovery, narrow layout |

The browser tests caught and fixed startup and recovery defects: Replay reset its sentence after completion; initial non-immersive XR initialization suspended a browser-started match; repeated storage-write failures overwrote the Save retry message; browser playback initially waited for spatial font preparation. The desktop loop now runs independently during VR initialization. Unit regressions cover these behaviors.

The new supporter-lyrics feature is a clearly labelled original text-only timing demo; no crowd audio or actual-song alignment is claimed. Native-language support currently means English; other native languages remain unimplemented.

Browser screenshots in this folder are actual implementation captures. `prototype-xr.png` is an **emulator** capture, not Quest footage. The handoff design PNG remains a static reference.

## Device and release gaps

- No Quest was connected during implementation. Hands-only completion, text legibility, seated reach, headset suspension, video/audio quality, and frame rate have no physical-device pass yet.
- Trace corridor is 0.09 normalized pitch units; maximum per-sample advance is 0.16 of the route; start radius is 0.10; fingertip plane depth tolerance is ±0.08 m. Tune these from Quest feedback.
- The sample is intentionally limited to one phrase. Full six-phrase content, optional recall review, text sizes, full accessibility/onboarding, Clear Progress, bounded review history, and release hosting remain later PRD work.
- Spanish wording, original chant text/translations and pronunciation, and English audio quality, await human review. No pilot or learning-effectiveness result is claimed.
- SDK bundling reports a large JavaScript chunk. Warm-cache readiness and frame budgets need Quest measurements. Current initial assets are below the proposed 60 MB budget; readiness is not yet measured on device.
- `npm audit` reports eight advisories in the generated development/reference toolchain (sharp/librsvg and reference-runtime dependencies). No compatible upstream fix is currently reported for the complete chain. No independent Three.js upgrade was applied. Review upstream patches before release.
- The stock TTF loader uses a limited default character set. The app now generates and applies a local atlas with explicit Spanish accents and punctuation before enabling VR; actual headset legibility still needs review.

## Exact development versions

Node 24.20.0; IWSDK core/CLI/reference/Vite plugin 1.0.1; `three` aliases `super-three` 0.181.0; UIKit 1.0.76; TypeScript 5.9.3; Vite 7.3.7; Vitest 5.0.3; Playwright 1.64.0; Blender 5.2.2 LTS. `app/package-lock.json` is authoritative.

The selected first device checkpoint is preserved: collect [QUEST_REVIEW.md](QUEST_REVIEW.md) observations before adding the six-minute match. No deadline, competition eligibility, or submission has been re-verified in this implementation task.

## Parallel-viewing runtime check

The managed IWSDK emulator entered an active immersive session with hand-tracking enabled. Real controller-ray selection opened Explore at approximately 14 seconds while the match kept playing, then the explicit Pause control changed the displayed status to “MATCH PAUSED BY YOU”. Replay revealed and retained the complete phrase. These inputs exercise the shared spatial ray-control path, not physical hand comfort or Quest acceptance. UI-relative row centres are insufficient for aiming: the development-only F9 diagnostic reports each relevant control's measured world position. F8 resets the original sample and seeks to 13 seconds for repeated development checks; both shortcuts are omitted from the production build.

The first near-window preview was clipped in the straight-ahead view. The layout correction makes far/high the new-user default, keeps a smaller deliberate near preset, and anchors the diagram to its actual UIKit blank area. Existing user positioning preferences remain valid. Default viewing and near fingertip reach need physical headset review.

## Full-source browser companion and Mobbin design adaptation

`watch.html` adds a separate 2D browser-window route alongside the original immersive experience. It uses YouTube’s public player with its native controls. The Barça full match was observed playing, first with a cued duration of 99:21 (the live clock rounds down to 99:20). The supplied Miami F1 upload returned owner embed restriction 150. After the user approved a different embeddable video, Oracle Red Bull Racing’s “Our First Win Of 2026!!! | Behind The Charge” was observed playing through the iframe. Its listing is 8:05 and its live player rounds to 8:04. It is behind-the-scenes coverage rather than a full race. No video was downloaded or proxied.

The source-scoped companion offers an original football pass or F1 overtake concept, independent Replay/Trace, explicitly requested pronunciation, phrase saving and game-moment bookmarks. BroadcastChannel connects a detached same-origin window to the single player clock, team preference and durable-save status. Opening, learning, saving and returning never issue play/pause/seek. Optional playback controls and bookmark jumps are explicit. Closing or losing a speaking companion restores the game volume. Manual practice is labelled clearly; there is no automatic action reconstruction or chant detection.

Mobbin references were inspected visually: [Frame.io](https://mobbin.com/screens/39416f38-9246-4a6d-bc30-79874a268b5e) for a dominant player and separate context panel; [Speak](https://mobbin.com/screens/cef4ab1d-b8b0-4080-96b3-616f466e86ac) for phrase/meaning/pronunciation hierarchy; [theScore](https://mobbin.com/screens/77b0fb1d-b4d1-40f3-9e6c-6a9f5f5711c9) for future team-tile setup; [Loom](https://mobbin.com/screens/208932bc-b2f9-4671-ac57-67868cf2d47e) for future timed lyric/transcript hierarchy. The implemented page adopts original dark surfaces, team accents, a larger player and a phrase-first companion. No Mobbin assets were copied. `full-match-browser.png` and `f1-browser.png` are actual live-page captures.

Streaming unit tests cover source labels, publisher error reporting, playback authority, bounded explicit seeking, phrase/route contracts, window-message validation, storage failures, corruption and recording-safe catalog migration. Six browser journeys substitute the public YouTube API to check practice/audio/saves, source switching, detachment/return, publisher failure, standalone use and cross-window storage failure, and narrow-window layout. These deterministic tests are distinct from the live publisher playback observations.

One full-suite run exposed a cold immersive startup exceeding the old 15-second readiness wait. The original sample now shows a preparation message immediately, and tests allow 30 seconds for its final immersive-readiness result. Browser viewing can start independently. A subsequent run exposed whole-journey timeouts under concurrent XR browser rendering. Unchanged desktop text and visibility now remain stable across animation frames, and completed diagrams redraw only when their progress changes. A browser regression observes no idle label replacement. The production desktop path now avoids creating an immersive scene when WebXR immersive support is absent; development keeps the IWSDK emulator path, and Quest retains scene initialization. Browser journeys run serially with a 60-second overall allowance; final readiness still has its separate 30-second bound. This does not establish a Quest loading-time or frame-rate result.

Quest Browser window movement, focus behavior, hand input, comfort and readability remain unverified on physical hardware. Full-source alternate commentary is limited to whatever the publisher offers; only the original sample has prepared English/Spanish switching. Real-song cues, fluent language review, and a full-race F1 source remain later work. The morning checklist covers both browser-window and immersive paths.

Final production verification: typecheck and build passed; 127 unit tests passed; all 18 browser journeys passed in 1.2 minutes after the unsupported-desktop startup correction. The managed development emulator also reached its ready state after the change. Its checked window was then closed; the HTTPS development server and HTTP production preview remain running. Actual Quest acceptance and fluent Spanish review remain pending.

## Physical Quest connection · 12 October 2026

A physical Quest 3 was detected with USB debugging authorized. Port 4173 was forwarded over USB, and Quest Browser was launched at `http://localhost:4173/watch.html?source=barca`. The device reports the browser as focused and visible; the user confirmed the Barça page is visible inside the headset. The available screenshot fallback returned black, so it is not visual acceptance evidence. Embedded playback, independent-window focus and movement, hand interaction, comfort, audio, persistence and immersive-session checks remain pending.

## Optional AI coach · 12 October 2026

Added `features/coach` with the actual ElevenLabs JavaScript SDK loaded on invitation, authored phrase context, voice/text sessions, concise transcript display and paginated spatial replies. The coach panel shares the learning companion's placement in theater and passthrough. Session teardown covers close, explicit End, app suspension, page exit and late connection resolution. Each speaking window is capped at 15 seconds and the conversation at five minutes. The provider has a 60-second silence cutoff. Playback authority stays with the match; the coordinator only ducks volume while the coach speaks or listens.

The public demo agent was created with the connected ElevenLabs plugin. Its prompt and verified settings are versioned in `app/src/features/coach/agent-config.json`; the actual ID is configured in ignored `.env.local`. The connector rejected advanced `body` arguments, so privacy/session limits were saved through the dashboard and verified with an agent read. The dashboard also rejected local hostname allowlist entries despite the documented localhost format; no origin restriction is claimed. Use a server-authenticated agent before external deployment.

Verification: TypeScript and production build passed; 153 unit tests passed across 22 files. Seven affected browser tests passed, including real provider text explanation and rejection of unsupported live-commentary knowledge, real streamed voice response with a synthetic microphone, ducking while the match plays, and microphone track termination after End. The synthetic mic test uses no person's voice. Mocked network tests exercise the actual SDK and cover opt-in start, text context/reply, close cleanup and connection failure. Full-match playback and F1 concept regression checks passed.

The existing build still reports large IWSDK bundle chunks. The coach client is dynamically loaded. Fluent Spanish/slow-delivery review and physical Quest microphone acceptance are pending; existing passthrough confirmation predates this coach feature.

Spatial input evidence: the emulator controller ray opened AI coach and closed it again; the coach entity changed visibility and the playback control remained “Pause” throughout, proving uninterrupted playback. The seated runtime showed the coach beside the match. No physical voice acceptance is inferred from this.

## Native KMP recap companion · 13 October 2026

The first mobile slice shares the recap rules and versioned local progress format in Kotlin, with Android Compose and iOS SwiftUI presentation. Users can manually name a football/F1 session, save authored phrases, answer a recap and retry mistakes. Example sessions are explicitly labelled. There is no automatic match analysis, headset import, account sync or native immersive renderer. The shared module has no Meta Spatial SDK dependency; future headset rendering remains a separate decision.

Verification: ten shared JVM tests pass, covering session isolation, sport validation, persistence, corrupt data, scoring and retries. Android builds successfully, and an instrumented emulator journey completes a three-question recap with 2/3, then retries the missed question for 1/1. The shared iOS framework and SwiftUI app build for an arm64 simulator, and the app launches. A system Apple Account verification alert obscured part of the iOS home screen; the full iOS interaction journey remains unverified. No physical mobile or Quest acceptance is claimed.

Existing web verification also passed: typecheck, 153 unit tests, production build and all three theater browser tests. A first browser-test invocation from the repository root failed because it did not use the app's Playwright configuration; the corrected invocation from app/ passed. The existing large-bundle warning remains.

Pending device review: on iPhone and Android, create separate football/F1 sessions, save/remove phrases, finish a quiz, retry mistakes and relaunch to confirm persisted progress. Check large text and narrow screens. On Quest, continue using the existing immersive prototype and verify uninterrupted playback when opening learning panels; the mobile companion does not yet connect to it. Prototype Spanish and audio await fluent review.

At this milestone Mobbin was awaiting connection. The later Playmaker/Matchday entry below records completed MCP research and the selected implementation.

## Viewing-to-mobile recap transfer · 13 October 2026

Confirmed architecture: IWSDK/WebXR continues to own immersive viewing; KMP owns the iOS/Android companion's shared learning logic. No Meta Spatial SDK migration is planned. The browser phrase library now exports a versioned recap file containing source metadata and only saved phrase IDs. Both native apps offer a file picker to import it. The user transfers the file between devices; no footage, local media paths, credentials, automatic synchronization or playback commands are included.

Import validates the entire document before changing progress. Unsupported versions, unknown or mixed-sport phrases, duplicate IDs, oversized files and invalid metadata are rejected. Repeated imports merge existing saves and retain results. Sample identity is explicit. The current immersive football/F1 packs each contribute one saved phrase and therefore one recap question; distractors come from the authored sport vocabulary.

Verification passed: web typecheck, 158 unit tests, production build, and five browser journeys including playing/paused exports for both sports and the three existing theater regressions. Sixteen JVM tests include a shared fixture contract verified against actual TypeScript exporter output; fifteen common tests also pass on the iOS simulator. Android and iOS builds pass. Three Android instrumented tests cover the existing quiz/retry loop, an F1 import through the actual file reader, and oversized-file recovery. The latter two stub the system picker's returned URI; they do not prove an end-to-end operating-system file transfer. Manual touch testing on the available XR-configured Android emulator did not open the picker reliably and is not counted as acceptance.

Physical Quest download, transfer to a phone, native file-picker selection, iOS UI flow and narrow-screen readability remain device-review cases in QUEST_REVIEW.md. Export is currently a browser-library action after leaving XR, not a spatial-panel action. Leaving XR retains the existing suspension behavior; exporting itself never changes playback. Spanish and audio remain awaiting fluent review. Mobbin research subsequently completed through MCP; see the design implementation below.


## Playmaker mobile + Matchday VR · 13 October 2026

The user selected Playmaker for Android/iOS and Matchday for the immersive experience after reviewing generated concepts. Mobbin references: [Duolingo picture answers](https://mobbin.com/screens/29316184-d3f6-4c7e-86d9-7283d5dc7038), [Nibble matching pairs](https://mobbin.com/screens/3424c6c1-8d86-457d-9b17-57cdae605466), and [Apple TV sports cards](https://mobbin.com/screens/3108fab5-990d-427d-9b5a-d8f671698727). Reference assets were not copied.

Mobile now uses warm ivory, cobalt primary actions, lavender/coral surfaces, original football/racing heroes, and illustrated phrase cards. Each Spanish question has three diagram answers from its actual sport vocabulary. Selecting does not score; Check answer does. The text-answer alternative and screen-reader descriptions preserve access to the existing translation exercise. Existing saved sessions, imports, scores and retries remain in the shared Kotlin model. Example cards stay explicitly labelled. Android uses Material 3; SwiftUI implements the same visual direction with native controls. Broader expressive motion, mobile team preferences and bottom-tab navigation remain future refinements, not implemented screenshot promises.

The source art lives in `app/src/features/recap/artwork/`: two generated heroes and six generated action illustrations, all with recorded prompts. The six actions share a simple cobalt/coral/lavender/ivory style across football and F1. `action-prompts.json` records the built-in image-generation prompts and pit-entry correction. Earlier SVG studies remain in `source/`; `render-actions.mjs` now writes only to ignored `schematic-preview/` so it cannot overwrite production art. Android and iOS consume the same PNG files in both collection and quiz. Bundled images load explicitly on iOS with PNG recompression disabled.

The collection now places Start recap above an adaptive grid of white illustration cards, with compact Save/Saved controls and descriptive accessibility labels. Large-text layouts use a single column. Android system-bar icons use the light-surface appearance. Cards remain fixed vocabulary examples: automatic match analysis and card generation are a proposed next experiment in the PRD, not implemented behavior.

Matchday restyles all six UIKitML panels and the desktop viewing companion. Neutral surfaces are burgundy, text is warm ivory, controls have softer corners and primary save/start controls use team accents. Team selection, placement presets, the original sample, passthrough transparency and playback authority remain unchanged. In an active IWSDK emulated VR session, controller selection started the full recording and opened Explore; its state read MATCH PLAYING and the playback clock advanced from 00:59 to 01:17. This is emulator evidence, not physical Quest acceptance.

Verification: 158 web unit tests; 19 affected browser tests passed (two live external-coach tests skipped); shared Kotlin 17 JVM tests and 16 iOS simulator tests passed; four Android instrumented tests passed; an iOS UI test passed for image presence, selection, explicit confirmation, feedback and the text alternative. Android debug APK, iOS simulator application and web production build pass. The existing large IWSDK bundle warning remains. Screenshots: `app/artifacts/playmaker-android-home.png`, `playmaker-android-quiz.png`, `playmaker-ios-home.png`, `playmaker-ios-quiz.png`, and `matchday-xr-runtime.png` (emulator). Physical headset/phone comfort, hand input, large-text review and Spanish fluency/audio review remain pending.

Collection illustration verification: web typecheck, 158 unit tests, production build and two recap-export browser tests passed. Shared Kotlin checks passed (17 JVM and 16 iOS simulator tests); five Android instrumented tests and two iOS UI tests passed. New tests verify save/remove state, the disabled empty recap, restored progress after relaunch, and the resulting one-question practice set. Actual collection screenshots are in `app/artifacts/playmaker-android-collection-{football,f1}.png` and `playmaker-ios-collection-{football,f1}.png`; the Android demo APK is installed on the review emulator. These are simulator/emulator checks, not physical phone or Quest acceptance. Spanish/audio review remains pending.


## Optional sports stories · 13 October 2026

The native mobile companion now offers **Stories between matches** on the sport home and inside a matching collection. Football’s “One minute left” and F1’s “Time to pit” each contain three authored fictional scenes with optional English support. The activities progress through an explicitly checked comprehension choice, a typed missing word with an optional hint, and an open Spanish answer followed by a model answer and self-reflection. Reading does not count as learning; recognition, assisted/unassisted recall and personal use are reported separately. Opinions are not automatically graded.

The new `app/src/features/stories/native/` feature owns its Kotlin catalog and state transitions, Compose/SwiftUI presentation and adjacent tests. Existing original Playmaker artwork is reused as illustration, not source-event evidence. Story attempts are in memory only and the result explains that they are not saved. Closing returns to the originating home or collection; retry creates a clean attempt. The existing recap data format, save/import behavior and immersive playback authority are unchanged. No transcription, live match recognition, card generation, automatic speech grading or new headset story surface was added. Spanish and existing audio still await fluent review; learning effectiveness has not been measured.

Verification: 21 shared JVM tests and 20 shared iOS simulator tests pass, including four new story state-machine tests. Both new Android story journeys pass, with all five existing Android tests passing across the initial run and focused recap rerun; a pre-existing recap expectation failed once and passed on a clean rerun. Both new iOS story journeys and the two existing recap journeys pass across focused runs. The expanding iOS answer field received a stable accessibility identifier after the initial test locator failed. An overlapping stale simulator runner interrupted one F1 run; the standalone rerun passes. Web typecheck, all 158 unit tests, production build and both recap-export browser tests pass; the existing bundle-size warning remains. Android debug and iOS simulator builds succeed.

Previews: `app/artifacts/story-android-{football,f1,summary}.png` and `app/artifacts/story-ios-{football,f1,summary}.png`. Android and iOS captures were checked for readable layout. These are emulator/simulator results; physical phone accessibility, fluent Spanish review and participant studies remain open. No physical Quest acceptance is claimed for this mobile feature.


## First batch from the actual recording · 13 October 2026

Six cards and two three-scene stories are now prepared from the local Barça–Madrid 2018 recording, identified by SHA-256 in `app/src/features/stories/content/barca-2018-opening.json`. The source is the runtime H.264 copy, so the timestamps correspond to the immersive player's recording position. The two passages are Bale/Benzema's early chance (10:40–10:55) and Alba/Coutinho's opening goal (13:28–13:42). Displayed match clocks remain distinct from recording position.

Whisper small via MLX transcribed the English commentary from recording 03:07–16:40 into 229 timed segments. Automatic language detection on the crowd introduction incorrectly returned Latin; that output was rejected and spoken English was explicitly selected. Codex inspected sequential frames and authored a short Spanish adaptation using both evidence types. Raw ASR misspellings of players and “left-handed volley” were not copied as facts. Narration after a play and footage of replays are not treated as new events. This is an AI-prepared, bounded authoring pass; it is not a live or unattended end-to-end detection system, and no custom model was trained.

Each card bundles recording and commentary ranges, a paraphrase of the commentary, visual observations, exact frame positions, and a pending Spanish review status. Six newly generated illustrations have their prompts under `app/src/features/stories/artwork/`; they are generic teaching aids, not captured frames or exact player likenesses. The original recording, extracted audio, full transcript, evidence sheets, model environment and frame files stay under ignored local paths.

Both native apps offer **Explore match moments** on the football home. Outcome content is hidden until an explicit **Reveal match moments** action; mobile does not assume the match has been watched. Each moment provides three cards, expandable evidence, and the same shared recognise → recall → use exercises as the fictional stories. Real-match stories display their source instead of a fictional label. The independent F1 and fictional story paths remain available. Prepared cards are not inserted into the fixed-ID saved-phrase/import format, and story attempts are not persisted. Playback is untouched.

Reproduce the local authoring evidence on Apple Silicon with FFmpeg installed:

```sh
python3 -m venv app/content-source/match-analysis/venv
app/content-source/match-analysis/venv/bin/pip install -r app/src/features/stories/authoring/requirements.txt
app/content-source/match-analysis/venv/bin/python app/src/features/stories/authoring/prepare_match.py --video app/public/media/user/barca-2018-h264.mp4 --output app/content-source/match-analysis/first-half-opening --start 187 --duration 813 --language en
app/content-source/match-analysis/venv/bin/python app/src/features/stories/authoring/prepare_frames.py --video app/public/media/user/barca-2018-h264.mp4 --pack app/src/features/stories/content/barca-2018-opening.json --output app/content-source/match-analysis/declared-evidence
node app/src/features/stories/authoring/generate-pack.mjs
node app/src/features/stories/authoring/generate-pack.mjs --check
python3 -m unittest discover -s app/src/features/stories/authoring -p 'test_*.py'
```

The frame extractor rejects a recording with a different hash. The transcription tool prepares evidence only; after inspecting it, author/edit the versioned JSON and run the generator to compile the same content into Kotlin for Android/iOS. Validate event correctness and Spanish separately before publication. The user’s recording is required to reproduce audiovisual checks; the mobile learning pack runs without shipping the video. [MLX Whisper reference](https://github.com/ml-explore/mlx-examples/blob/main/whisper/README.md) and [pretrained model](https://huggingface.co/mlx-community/whisper-small-mlx).

Verification of this batch: shared Kotlin tests pass on JVM (25) and iOS simulator (24); all nine Android instrumented tests and all five iOS UI tests pass. The new journeys check spoiler gating, source/evidence display, real-match practice completion, return/reset, and the separate F1 route. Two Python timestamp tests pass and the generated Kotlin pack matches its canonical JSON. The evidence extractor successfully recreated all six frame sequences from the hash-matched recording. Web typecheck, 158 unit tests, production build and 25 browser tests pass; two external-coach tests are skipped. The existing large-bundle warning remains. Previews: `app/artifacts/match-cards-{android,ios}-{cards,story}.png`. This is simulator/emulator evidence, not physical device acceptance or a fluent-Spanish sign-off.


## Inline match replays · 13 October 2026

The six actual-match cards and their story scenes now offer an inline local video replay above the Spanish phrase. `MatchReplay` derives a deterministic filename and a two-second lead-in from the existing evidence, without extending past its end. Android uses a short-lived `VideoView`; iOS uses AVKit. Starting a different card releases the previous replay, backgrounding pauses it, and scene changes leave the next card stopped. The user chooses pause/play/replay or returns to the illustration. The web/Quest match playback authority is not connected to these mobile controls.

Optional clips contain the user's broadcast recording and original commentary; they are **private local demo resources, not original artwork or public repository assets**. The Android debug source set reads `app/native/local-media/res/raw`; iOS's optional resource directory reads the same files. That entire directory is ignored. Android release builds omit these resources. Before distributing any iOS build, omit the private resource directory or supply appropriately licensed media. A clean checkout builds with a clear unavailable-replay message and the original illustrations.

Reproduce clips from the exact source, with FFmpeg installed:

```sh
python3 app/src/features/stories/authoring/prepare_clips.py --video app/public/media/user/barca-2018-h264.mp4 --pack app/src/features/stories/content/barca-2018-opening.json --output app/native/local-media/res/raw
```

The extractor verifies the recording hash, validates source/ranges, re-encodes independently decodable H.264/AAC excerpts and checks every output duration. Six clips total about 6.7 MiB. No recording, thumbnail or broadcast frame is committed. This is playback of preselected verified passages, not real-time commentary analysis.

Verification: shared Kotlin tests pass on JVM (27) and iOS simulator (26); five Python authoring tests pass. The Android replay journey verifies real decoder progress, pause, background/foreground remaining paused, one-player ownership, completion/replay, and release on lesson/scene navigation. Two existing match-card journeys also pass. The first run exposed VideoView re-preparation resuming playback after backgrounding; explicit playback intent fixes this, and the focused rerun passes. Both affected iOS UI journeys pass; the replay test locator was corrected to select the presented story's button rather than the matching hidden card beneath its modal. Web typecheck, all 158 unit tests, production build and both recap-export browser tests pass; the existing bundle-size warning remains. The updated APK is installed on the Samsung, but physical replay acceptance is not claimed. The user requested emulator-only automated UI inspection: the attempted Android CLI helper installation failed and the helper was confirmed absent from the phone's main profile. No further phone instrumentation is performed.

Final emulator layout check confirms actual match footage, replay controls, Spanish and English fit together on the card. The local-only screenshot is `app/content-source/match-analysis/replay-review/android-replay.png`; it includes broadcast footage and is intentionally ignored.


## Match Lab: floating moments and Alba’s cutback · 13 October 2026

The immersive viewer now has **Match Lab · Alba’s cutback** for the local Barça recording. It works inside the existing Theater and My room / passthrough scene policies. One floating card at a time presents the six previously prepared match moments; selecting its illustration or **Flip card** reveals the English translation. **Read story** shows the corresponding scene from the two three-scene stories. Navigation keeps the illustration, text and optional replay on the same evidence range. These are prepared, source-grounded cards, not live generation or automatic recognition of the current match frame.

**Practise cutback** uses a small spatial pitch: select the ball, then choose a teammate behind it relative to the attacking goal. Two arrangements reverse the attack direction, so repeating a screen position is insufficient. Wrong choices receive feedback; demonstrations never count as answers. The original board is a lightweight procedural model (352 triangles in its isolated preview). It is a teaching arrangement, not a reconstruction of exact player positions. Point-and-select is implemented; free dragging, room surface detection and automatic voice assessment are future work.

The feature lives under `app/src/features/match-lab/`, with separate state, card selection, replay, persistence, desktop and spatial adapters. Main-match controls remain exclusively in the existing session/player. Replays use a second, muted video element and never seek or pause the main recording. Closing, changing cards or leaving the active match stops the excerpt and cancels pending phrase speech. Saved phrases remain local to Match Lab; mobile export and account sync are not connected to these new card IDs.

The six original illustrations are reused from the existing generated story pack; their provenance remains under `app/src/features/stories/artwork/prompts.json`. Run `python3 src/features/match-lab/prepare-media.py` from `app/` to prepare the private, silent replay excerpts and provisional macOS Mónica Spanish readings. Excerpts stay ignored under `public/media/user/`; the original illustrations and speech are source-controlled. Both Spanish text and prototype pronunciation await fluent review.

Verification: typecheck, 179 unit tests and production build pass. The complete browser suite passes 28 tests with two external voice-service cases skipped; the three Match Lab journeys are rerun after the final feedback fix. Browser tests cover playing and explicitly paused match intent, both practice arrangements, card/story reveal and navigation, actual replay decoder progress, and missing media recovery. The shared font test includes every prepared Spanish card and story scene. Initial UIKit loading still emits missing-accent warnings before the existing custom Spanish atlas is applied; these do not recur during the tested interactions.

In IWSDK’s browser-based Quest emulator, real controller rays selected the card face, story navigation, replay, ball and recipients, completed both arrangements, and changed side/distance/height. A compact runtime review confirmed separation from the main screen and distinct feedback colours. This is emulator evidence only. Physical Quest 3 hand targeting, seated readability, playback smoothness with two videos, and passthrough comfort remain pending the checklist in `docs/QUEST_REVIEW.md`. Private screenshots containing broadcast footage and diagnostic output stay in ignored `app/.iwsdk/match-lab-evidence/`.


## Direct manipulation and handheld cards · 14 October 2026

Scene-authored window anchors now own the match screen, playback controls, welcome, learning/library, Explore, chants, coach and Match Lab. Dedicated peach near-grab bars use IWSDK TwoHandsGrabbable; blue distance handles move windows and gold corner handles scale them uniformly. Separate targets avoid attaching grab behavior to UIKit buttons. One interaction owns a window at a time, hidden windows release their handles, and Reset layout restores the authored pose and size. Pose changes are session-local and have no reference to the match player. Existing placement presets deliberately reset the relevant window.

The selected Match Lab moment is a rounded 3D card with a Spanish front, English reverse and source illustration/replay surface. One or two hands can hold the whole card; wrist rotation reveals the actual reverse surface. The UI tracks which face points toward the viewer with hysteresis, and button flipping remains available. Card textures redraw only when the selected moment/story changes. Navigation replaces the content of one physical card, rather than spawning six cards simultaneously. Story/evidence generation is unchanged.

The new feature is under `app/src/features/spatial-windows/`; `match-lab/handheld.ts` owns card presentation. Shared material/geometry prototypes remain in the asset manifest and placed clones receive their own dynamic textures. The reusable rounded card has no model diagnostic warnings. Private runtime screenshots containing match footage stay in ignored `app/.iwsdk/`.

Verification includes typecheck, 189 unit tests, a production build, the full 28-passing browser suite (two external voice tests skipped), and controller interactions in an active IWSDK Quest emulator. Measured near grabs moved and wrist-flipped the card, two hands enlarged it, and release preserved its pose. A distance handle moved Match Lab approximately 40 cm and its corner resized it to 1.4×; the cutback button remained usable after moving the hand clear of the near card. The main screen moved approximately 45 cm and resized to 0.8× while the match clock advanced. Reset returned the screen to its initial transform without restarting playback. Scene and model previews validate; a compact runtime review checks card faces and window separation. Physical hand pinch, tracking-loss recovery, passthrough comfort and sustained headset performance remain pending `docs/QUEST_REVIEW.md`.

### Audiovisual recognition experiment · 14 October 2026

Added `src/features/match-recognition/recognize.py`: prepare a bounded local video
excerpt with audio, optionally analyze it with Gemini, and validate timestamped
observations, proposed Spanish cards and linked story sentences. No client key,
web endpoint, automatic publication or headset integration is introduced. Unknown
footage/replays and uncertain observations are withheld from candidate cards;
all remaining output still requires factual and fluent Spanish review. Gemini
self-reported confidence is explicitly uncalibrated.

The actual local recording at 808–828 seconds was prepared successfully: 20 seconds,
audio present, approximately 3.24 MB. No model request was made because no Gemini
key was configured at verification time. No recognition accuracy or latency result
is claimed. Physical TV camera input remains unimplemented and requires Quest
permission/immersive-session verification.

Verification: typecheck, 190 Vitest tests (including a wrapper for 13 Python
recognition checks), production build, and all six affected Match Lab/theater
browser tests passed. The build retains existing chunk-size and custom-font
coverage warnings. Synthetic response tests verify evidence gating, schema/range
validation, story references, provider failure handling and secret-free output;
they are not model-quality or physical-headset evidence.

### Cloud recognition connection and first model result · 15 October 2026

Google Cloud CLI installed locally; user completed ADC sign-in with quota project
`arenavoca`. The analyzer now supports `--project arenavoca` using the fixed
project-scoped Agent Platform Interactions endpoint, short-lived bearer credentials
and explicit quota project. AI Studio remains an optional separate route. Provider
errors expose only known recovery hints, never raw private error content.

Actual model request succeeded for the prepared 808–828 recording passage with
audio, using `gemini-3.8-flash` and 4 fps sampling. It returned four draft cards
(run, cutback, shot, goal) and three linked story sentences in 17.92 seconds.
Reported usage: 2,717 input tokens, 772 output tokens, 1,353 thought tokens, 4,842
total. No monetary cost or trial-credit deduction has been verified: reading
billing metadata returned HTTP 403. Do not describe this request as free.

Comparison against existing pack and two sequential-frame contact sheets: the
cutback interval 814.5–816.5 falls inside the prepared 814–817 evidence interval.
The model omits the initial run lead-in, and its shot/goal boundaries are late
(the sampled frame at 816 already shows the keeper down after the finish). Its
scoreboard-change claim is unsupported within the declared interval: inspected
frames through 821 still show 0–0. The left-foot claim is not established by this
spot-check. All four observations were self-rated high confidence, demonstrating
why confidence alone cannot approve learning content. Raw results remain unchanged
in the ignored match-analysis directory, alongside a separate review.json.

No draft was published to Match Lab/mobile. This is one positive football clip,
not an accuracy benchmark; ambiguous footage, misses, replays, F1 and actual
headset-camera recognition remain untested. Fluent Spanish review is pending.

Verification after the Cloud adapter: typecheck, 190 Vitest tests (including 17
Python checks), production build and six Match Lab/theater browser tests passed.
Existing font-coverage and bundle-size build warnings remain. No device acceptance
or billing verification is inferred from those checks.

## 16 October 2026 — Original tabletop pass/shot slice

Match Lab now opens an independent miniature football practice area and instruction window in the shared theater/passthrough scene. One original player design is reused for two teammates. Drawcall GLTS source and local GLB exports are retained under `app/content-source/drawcall/` and `app/public/models/match-lab/`; generator access was denied after login, so no AI-generated model is claimed. No new app dependency or renderer was added.

Practice rules evaluate ball selection, teammate/goal choice and bounded near-hand release coordinates. Passing and shooting have separate prompts, wrong-action feedback, optional translation and reset. Near grabbing uses IWSDK; distance selection uses a separate coral ring because the grabbable ball did not respond reliably as a ray target. The table and instruction card reuse spatial-window move/resize controls. This is assisted placement rather than throwing physics. Cards and old cutback practice remain available and the match playback authority is untouched.

Typecheck, 222 unit tests, production build and nine affected browser tests passed. Managed emulator input completed a near-grab backward pass, then ray-selected passes/shots and spatial Next. Scene render validation and visual inspection passed. Physical device cases are recorded in `docs/QUEST_REVIEW.md`; no Quest acceptance, live-camera support or learning efficacy is claimed. Existing build warnings remain.
