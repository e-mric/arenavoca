# ArenaVoca

**Your sport. A new way to speak.**

Learn languages through immersive sports. Watch football, F1 and more in a virtual theater or mixed reality on Meta Quest.

[GitHub repository](https://github.com/e-mric/arenavoca)

The primary prototype is an **immersive sports viewing lounge** with a large match screen and optional floating Spanish panels. Choose **Theater** for the enclosed room or **My room · Passthrough** to keep your real surroundings visible behind the screen. Both use one video timeline; Explore, Replay and Save leave playback running. Pause remains explicit.

The locally supplied Barça 5–1 Madrid full match is configured as the native immersive source. The original 30-second passing sample remains available at `/?sample=1`. Football and F1 practice share learning behavior and supply different vocabulary and diagrams. A native F1 race needs its own local video; the separate YouTube browser player remains available as a secondary route.

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
  progress/      Validated device-local snapshots and storage failure behavior
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
