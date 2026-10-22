# ArenaVoca — Amazon Fire TV submission

Reviewed: 2026-10-22. Judge entry point for the **Vega** prototype.

ArenaVoca lets sports fans practise Spanish through optional moments from the
sequence they are watching. The match fills the screen by default. A remote opens
illustrated cards, English translations, local saves and a short recall question.
Opening a card does not pause or seek the match.

## Build and run

The submission target is a separate React Native/Kepler app, not the Android APK
or the repository's older Quest/web prototype. Follow the
[Vega build guide](app/src/features/tv-learning/vega/README.md#build).
It uses the original, bundled 36-second **Blue vs Amber** animation. No recording,
API key or paid AI account is needed to run it. Amazon's SDK and its dependency
registry must be available to build it; FFmpeg must be on PATH.

## Try the learning loop

1. Launch the app and press Select to show controls; choose Play.
2. Watch the pass. At eight seconds, a moment becomes available. Open Moments
   and The pass. The match continues while the Spanish card stays selected.
3. Choose English, then Save. Return to watching with Back.
4. The shot and save become available at 20 and 28 seconds. They are prepared
   cues driven by the video's actual position.
5. Open Saved, select a card and choose Practise. Try an answer and see feedback.
6. Quit and reopen: saved cards and video position remain local; playback restores
   paused. Restart is in Match details; Watch again is available at the end.

## Submission boundaries

This version uses prepared content, not live computer vision or automatic event
recognition. It has no TV-to-phone sync, comic reader or independent replay.
Mobile and Quest are separate prototypes. Spanish awaits fluent review.
The current device evidence is from the official Vega 1080p simulator; physical
Fire TV, 720p and screen-reader usability remain unverified.

The optional Alba Debug build needs private local media and additional local
artwork; those are not required for, or included in, the original-media release.

## Sources and verification

- [Implementation, tests and SDK findings](app/src/features/tv-learning/vega/README.md)
- [Native build scripts and lockfile](app/native/vegaTV/package.json)
- [Original animation authoring source](app/src/features/tv-learning/authoring/render_sequence.py)
- [Existing card illustration source](app/src/features/recap/artwork/render-actions.mjs)
- [Video scenario and narration](docs/submission/amazon-video.md)

Source delivery does not complete the Devpost submission. Judge access, the public
demo video, final project description and required tool feedback must also be
completed. The owner handles access to this private repository.
