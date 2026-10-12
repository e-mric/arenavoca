# First prototype implementation evidence

12 October 2026 · Milestone A implementation prepared; actual Quest review pending.

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

`npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e` pass. There are **127 unit tests in eighteen files** and **eighteen production browser journeys**. Future features must include tests as requested by the user.

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
