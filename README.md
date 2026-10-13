# ArenaVoca

**Your sport. A new way to speak.**

Learn languages through immersive sports. Watch football, F1 and more in a virtual theater or mixed reality on Meta Quest.

[GitHub repository](https://github.com/e-mric/arenavoca)

The primary prototype is an **immersive sports viewing lounge** with a large match screen and optional floating Spanish panels. Choose **Theater** for the enclosed room or **My room · Passthrough** to keep your real surroundings visible behind the screen. Both use one video timeline; Explore, Replay and Save leave playback running. Pause remains explicit.

The locally supplied Barça 5–1 Madrid full match is configured as the native immersive source. The original 30-second passing sample remains available at `/?sample=1`. Football and F1 practice share learning behavior and supply different vocabulary and diagrams. A native F1 race needs its own local video; the separate YouTube browser player remains available as a secondary route.

The optional **AI coach** explains the selected phrase, models it slowly, and offers short Spanish practice in a floating panel. Choose Start voice explicitly, or use text mode without a microphone. The match keeps playing. [Coach setup](app/README.md#optional-ai-coach) · [AI roadmap](PRD.md#ai-coach-roadmap--12-october-2026).

Three personas are in [docs/PERSONAS.md](docs/PERSONAS.md). The user confirmed real-room passthrough and the floating screen on physical Quest 3. Hand comfort/performance, upcoming Meta VR glasses acceptance and fluent Spanish review remain pending.

## Run

```sh
cd app
npm ci
npm run dev
```

The official IWSDK development command opens its managed browser and reports an HTTPS URL. To inspect the production build:

```sh
npm run build
npm run preview
```

Open **http://127.0.0.1:4173/** for the immersive full-match prototype, or **http://127.0.0.1:4173/?sample=1** for the original calibration sample. The same production preview can be used on Quest over USB; see [the morning Quest checklist](docs/QUEST_REVIEW.md). Keep the Mac awake during testing. No site has been published.

## Verify

```sh
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run test:e2e
```

Install the test browser once with `npx playwright install chromium`. Browser tests run against the production preview, and use isolated browser storage. See [test coverage and current evidence](docs/IMPLEMENTATION.md).

## Feature-based structure

```
app/src/features/
  content/       Typed, versioned contracts and validation
  playback/      Preloaded video and authored prompt/caption intervals
  session/       Modes, playback intent, command coordinator, browser views
  learning/      Tactical drawing, route projection, deliberate tracing
  audio/         Preloaded pronunciation and commentary ducking
  coach/         Optional ElevenLabs conversation, context, lifecycle and tests
  progress/      Validated device-local snapshots and storage failure behavior
  recap/         Web-to-mobile export contract, shared Kotlin quiz rules and mobile UI
  sports/        Shared football/F1 concept packs and diagrams
  streaming/     YouTube clock, detachable browser companion, source-scoped saves
  theme/         Compatible football/F1 team palettes and contrast
  karaoke/       Original opt-in team-filtered text timing
  xr/            IWSDK surfaces, spatial UI binding, hand-joint projection
```

Tests live beside each feature. Cross-feature browser journeys live in `app/tests/e2e/`. Shared code stays in `app/src/shared/`; `src/index.ts` only connects the runtime and features. New features must include meaningful tests.

[PRD](PRD.md) is the product authority. [Three personas](docs/PERSONAS.md) turn the prototype into concrete experience scenarios. [Original content sources](app/content-source/asset-provenance.md) include the Blender project, movement data, speech metadata, and review status.

Pinned SDK: IWSDK 1.0.1; Three.js is the generated `super-three@0.181.0` alias. Development used Node 24.20.0. The lockfile records exact installed versions. Keep the SDK dependency set together.

Team choice changes browser and spatial panel identity using football/F1 palettes. Full-match practice concepts are selected manually, without event detection. The downloaded recording retains its source audio; Spanish Listen supplies phrase pronunciation. Only the original sample has the prepared alternate Spanish commentary. Native-language dubbing, real supporter-song alignment and automatic event detection remain future work.

The user-supplied recording and its H264/AAC demo conversion stay local and are ignored by Git. `app/public/content/theater-source.json` points to `media/user/barca-2018-h264.mp4` (1280×720, 25 fps, 99:21). A fresh checkout needs that local file or the explicit calibration fallback. The F1 browser replacement is an 8:05 behind-the-scenes video, not a full race. No media was published.

## Native KMP companion (first slice)

The Android and iOS companion shares a Kotlin match-recap engine. Import saved phrases from a viewing session or create a manually named football/F1 session, answer questions and retry mistakes. Example sessions are labelled. Progress is local; account sync is not implemented. IWSDK remains the immersive runtime and event prototype, with no planned Meta Spatial SDK migration.

For cards based on the actual Barcelona–Madrid recording, select **Football → Explore match moments → Reveal match moments**. Six illustrated cards and two stories cover an early Madrid chance and Barcelona’s opening goal. Each card includes a recording timestamp and **Why this card?** evidence. This offline batch combines a local English transcript with AI inspection of sequential frames; it is not live match detection, and Spanish still awaits fluent review. The recording, audio and extracted frames are not included in Git.

For optional practice between matches, select **Football** or **F1**, then **Explore a story**. “One minute left” and “Time to pit” each offer three fictional scenes followed by recognise → recall → use activities. English support and recall hints are optional. Personal responses use self-reflection, not AI grading. Story attempts are not saved in this first slice; existing recap progress remains local and persistent. Feature code and tests live in `app/src/features/stories/native/`.

To continue a viewing session on mobile: save a phrase, leave immersive mode, open the browser **Your phrases** library and choose **Export saved phrases**. Move `arenavoca-recap.json` to your phone using your preferred file-transfer method. In the native app, choose **Import saved phrases**, select the file and start the recap. The export contains phrase IDs and session metadata, never the recording. Each current full-match sport pack contributes one implemented phrase, so its recap contains one question. Re-importing merges saves and keeps existing scores. Files larger than 32 KB, invalid documents and unsupported phrases are rejected without changing progress.

- Build configuration: `app/native/` (JDK 17, Android SDK 36, Gradle wrapper).
- Shared feature and tests: `app/src/features/recap/native/commonMain` and `commonTest`.
- Android presentation: `app/src/features/recap/native/androidMain`.
- iOS presentation: `app/src/features/recap/native/iosMain` (SwiftUI).
- Android: set `ANDROID_HOME` or an ignored `app/native/local.properties` with `sdk.dir`, then run `cd app/native && ./gradlew :shared:jvmTest :androidApp:assembleDebug`.
- iOS: install Xcode and XcodeGen, run `cd app/native/iosApp && xcodegen generate`, then open `ArenaVoca.xcodeproj`. The build phase compiles and embeds the shared Kotlin framework. Physical installation requires your own signing team; arm64 simulators are supported.
- Native UI smoke test: with an Android emulator connected, run `cd app/native && ./gradlew :androidApp:connectedDebugAndroidTest`.

Pinned native toolchain: Kotlin 2.4.21, AGP 9.3.1, Gradle 9.5.0. Shared state has no Meta SDK dependency. Platform selection for future Vision Pro/Steam Frame experiences remains open.


### Selected visual direction

Playmaker is the mobile companion's Material 3 Expressive-inspired direction: original football/F1 artwork, warm ivory and cobalt, illustrated collections and action-choice quizzes with explicit confirmation and a text alternative. Android uses Compose Material 3; iOS uses SwiftUI. Matchday is the immersive/desktop viewing direction: dark burgundy panels, warm readable text and team accents around uninterrupted viewing. See `docs/IMPLEMENTATION.md` for verification and `docs/QUEST_REVIEW.md` for pending physical-device checks.

Native UI tests: run `androidApp:connectedDebugAndroidTest` on an Android emulator/device. For iOS, regenerate `app/native/iosApp/ArenaVoca.xcodeproj` using XcodeGen and test the ArenaVoca scheme on an iOS simulator; `ArenaVocaUITests` checks bundled artwork and the visual-answer flow. The two generated hero illustrations and their original prompts are in `app/src/features/recap/artwork/`; action diagrams have editable SVG sources there.
