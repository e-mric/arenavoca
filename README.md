# Football Spanish Companion

The first runnable prototype: a 30-second original blue-versus-amber passing play with synchronized captions and a Spanish phrase, Explore, deliberate pass tracing, Replay, on-demand pronunciation, and device-local saving. Watch and Explore run in both a browser preview and IWSDK world-space panels.

The six-minute match and recall activity are later milestones. Actual Quest 3 acceptance and Spanish language review are still pending.

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

Open **http://127.0.0.1:4173/** on the Mac. The same production preview can be used on Quest over USB; see [the morning Quest checklist](docs/QUEST_REVIEW.md). Keep the Mac awake during testing. No site has been published.

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
  xr/            IWSDK surfaces, spatial UI binding, hand-joint projection
```

Tests live beside each feature. Cross-feature browser journeys live in `app/tests/e2e/`. Shared code stays in `app/src/shared/`; `src/index.ts` only connects the runtime and features. New features must include meaningful tests.

[PRD](PRD.md) is the product authority. [Three personas](docs/PERSONAS.md) turn the prototype into concrete experience scenarios. [Original content sources](app/content-source/asset-provenance.md) include the Blender project, movement data, speech metadata, and review status.

Pinned SDK: IWSDK 1.0.1; Three.js is the generated `super-three@0.181.0` alias. Development used Node 24.20.0. The lockfile records exact installed versions. Keep the SDK dependency set together.
