# First prototype implementation evidence

12 October 2026 · Milestone A implementation prepared; actual Quest review pending.

## Delivered

- Official TypeScript IWSDK 1.0.1 scaffold in `app/`, reorganized into feature folders with colocated unit tests.
- Original 30-second, 720p, 30 fps Blender passing clip, with prepared English commentary mixed into the video. Match video is 512,507 bytes.
- One validated Spanish phrase and a diagram derived from the same passing endpoints.
- A replay prompt window at 12–20 s; captions and prompts read the video position, with no independent match timer.
- Explore pauses playback; Back restores prior playback intent at the same video position.
- Deliberately armed tracing, selected left/right hand, continuous corridor, tracking/depth freeze, progressive sentence chunks, and a complete Replay alternative.
- Preloaded, explicitly requested Spanish pronunciation through Web Audio, non-overlapping restart, explicit Stop, and commentary ducking that respects mute.
- Durable Save with no duplicate entries; invalid or unavailable storage recovery; resumable position/seen events/preferences; Your phrases; restart preservation.
- Browser preview plus world-space UIKitML controls and Three.js video/diagram surfaces. Required hand-tracking feature; no locomotion or controller-only dependency.
- HTTPS development route and USB loopback route to the production build. No publication or deployment performed.
- Three fictional personas with concrete experience and verification scenarios.

## Automated evidence

`npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e` pass. There are **70 unit tests in nine files** and **six production browser journeys**. Future features must include tests as requested by the user.

| Feature | Evidence |
| --- | --- |
| Content | IDs, references, safe paths, interval bounds, eight-second limit, overlap, normalized positions, accents, nested deployment base |
| Playback | Complete Blob preload, decoding failure, empty/failed assets, authoritative boundaries, caption timing, exposure deduplication |
| Learning | Deliberate arming, start requirement, corridor tolerance, no teleporting, monotonic progress, tracking/depth freeze, chunk reveal, multi-segment mapping |
| Audio | No autoplay, repeated Listen without overlap, ended/Stop restoration, mute preservation, delayed-resume cancellation, load failure |
| Progress | Save deduplication/reopening, corruption/version mismatch, access denial, quota errors, resumable state |
| Session | Ignored completion, playing/paused Back, restart preservation, library pause, suspension/resume, autoplay rejection, delayed play race, card expiration |
| Coordinator | Replay retains complete phrase, trace selection/reset, stale pronunciation cancellation, mute changes during playback |
| XR | Required hand-tracking, no locomotion, in-world controls/hand ray components and local font bindings; active emulated immersive session observed |
| Browser journeys | Watch → trace/listen/save/back/reopen, Replay, ignored muted offline completion, failed Save, media/audio recovery, narrow layout |

The browser tests caught and fixed startup and recovery defects: Replay reset its sentence after completion; initial non-immersive XR initialization suspended a browser-started match; repeated storage-write failures overwrote the Save retry message; browser playback initially waited for spatial font preparation. The desktop loop now runs independently during VR initialization. Unit regressions cover these behaviors.

Browser screenshots in this folder are actual implementation captures. `prototype-xr.png` is an **emulator** capture, not Quest footage. The handoff design PNG remains a static reference.

## Device and release gaps

- No Quest was connected during implementation. Hands-only completion, text legibility, seated reach, headset suspension, video/audio quality, and frame rate have no physical-device pass yet.
- Trace corridor is 0.09 normalized pitch units; maximum per-sample advance is 0.16 of the route; start radius is 0.10; fingertip plane depth tolerance is ±0.08 m. Tune these from Quest feedback.
- The sample is intentionally limited to one phrase. Full six-phrase content, optional recall review, text sizes, full accessibility/onboarding, Clear Progress, bounded review history, and release hosting remain later PRD work.
- Spanish wording and pronunciation, and English audio quality, await human review. No pilot or learning-effectiveness result is claimed.
- SDK bundling reports a large JavaScript chunk. Warm-cache readiness and frame budgets need Quest measurements. Current initial assets are below the proposed 60 MB budget; readiness is not yet measured on device.
- `npm audit` reports eight advisories in the generated development/reference toolchain (sharp/librsvg and reference-runtime dependencies). No compatible upstream fix is currently reported for the complete chain. No independent Three.js upgrade was applied. Review upstream patches before release.
- The stock TTF loader uses a limited default character set. The app now generates and applies a local atlas with explicit Spanish accents and punctuation before enabling VR; actual headset legibility still needs review.

## Exact development versions

Node 24.20.0; IWSDK core/CLI/reference/Vite plugin 1.0.1; `three` aliases `super-three` 0.181.0; UIKit 1.0.76; TypeScript 5.9.3; Vite 7.3.7; Vitest 5.0.3; Playwright 1.64.0; Blender 5.2.2 LTS. `app/package-lock.json` is authoritative.

The selected first device checkpoint is preserved: collect [QUEST_REVIEW.md](QUEST_REVIEW.md) observations before adding the six-minute match. No deadline, competition eligibility, or submission has been re-verified in this implementation task.
