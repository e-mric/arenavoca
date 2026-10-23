# ArenaVoca — Amazon Fire TV submission

Reviewed: 2026-10-23. Judge entry point for the **Vega** prototype.

ArenaVoca lets sports fans practise Spanish through optional moments from the
sequence they are watching. The match fills the screen by default. A remote opens
illustrated cards, English translations, local saves and a short recall question.
Opening a card does not pause or seek the match.

## Build and run

The submission target is a React Native/Kepler (Vega) app; other ArenaVoca
prototypes live on the `full-project` branch. Follow the
[Vega build guide](app/src/features/tv-learning/vega/README.md#build).
It bundles a 36-second cut of **Barcelona vs Madrid (28 October 2018)**, recording
13:28–14:04 of FC Barcelona's official YouTube upload, tracked in the repository;
the full match is not included. The quickest way to try it is the prebuilt
release package in the repository, the exact build that passed the 23 October
simulator journeys
([`arenavoca-vega-aarch64-release.vpkg`](app/native/vegaTV/prebuilt/arenavoca-vega-aarch64-release.vpkg),
SHA-256 `aad0e74b4a5079b7d17aa427709965994543a432f54bebc58c3fe9a882a4ec91`):

```bash
vega virtual-device start --timeout 120
vega run-app app/native/vegaTV/prebuilt/arenavoca-vega-aarch64-release.vpkg \
  com.arenavoca.tv.main -d VirtualDevice
```

No API key or paid AI account is needed. Building from source needs Amazon's SDK and its dependency registry; FFmpeg must be
on PATH.

## Try the learning loop

1. Launch the app and press Select to show controls; choose Play.
2. Watch Jordi Alba's run. At six seconds, a moment becomes available. Open
   Moments and Behind the defence. The match continues while the Spanish card
   stays selected.
3. Choose English, then Save. Return to watching with Back.
4. The pass back and the opening goal become available at 9 and 14 seconds. They
   are prepared cues driven by the video's actual position.
5. Open Saved, select a card and choose Practise. Try an answer and see feedback.
6. Quit and reopen: saved cards and video position remain local; playback restores
   paused. Restart is in Match details; Watch again is available at the end.

## Submission boundaries

This version uses prepared content, not live computer vision or automatic event
recognition. It has no TV-to-phone sync, comic reader or independent replay.
Mobile and Quest prototypes are on `full-project`. Spanish awaits fluent review.
The current device evidence is from the official Vega 1080p simulator; physical
Fire TV, 720p and screen-reader usability remain unverified.

An opt-in YouTube build streams the same moment from FC Barcelona's upload. On
the Vega simulator, YouTube streaming stalls after a few seconds for any video
(including YouTube's own sample), so the submitted build plays the local cut.

## Sources and verification

- [Implementation, tests and SDK findings](app/src/features/tv-learning/vega/README.md)
- [Native build scripts and lockfile](app/native/vegaTV/package.json)
- [Media and credits](README.md#media-and-credits)
- [Card content](app/src/features/stories/content/barca-2018-opening.json)
- [Video scenario and narration](docs/submission/amazon-video.md)
- [Clean-checkout verification (22 October, Blue/Amber build)](docs/submission/vega-verification.md)

Source delivery does not complete the Devpost submission. Judge access, the public
demo video, final project description and required tool feedback must also be
completed. The owner handles access to this private repository.
