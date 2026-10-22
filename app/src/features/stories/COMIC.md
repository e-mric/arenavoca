# Alba comic and optional warm-up

Reviewed: 2026-10-21.

This native Android prototype uses three prepared manhwa panels for Alba's run,
cutback and Coutinho's finish. It keeps the cream, blue, navy, lavender and coral
palette and reuses the existing source-backed Spanish/English phrases. The
illustrations explain the action; they are not exact player-position reconstructions.
There is no runtime image generation, live recognition or TV-to-phone synchronisation.

## Try it

- **Phone:** Barcelona vs Madrid → Stories → La jugada de Alba.
  Scroll one continuous story with angled gutters, boot/ball and goal-detail inserts and
  captions overlapping the three main panels. Hold a Spanish caption to reveal English; release or
  cancel to hide it. A short tap does nothing. Accessibility activation toggles
  English with an explicit Hide English action. Backgrounding hides the translation.
  Replay moment opens the local source clip in a translucent stadium-outline dialog when included in the debug build. Close or Back returns to the same scroll position. Pause/repeat and expansion affect only this independent replay.
- **TV:** in the local Alba variant, Select → Comic. Panels unlock at 6, 9 and
  14 seconds from the actual player position. Hold Select on the focused Spanish
  caption for English; release, focus loss or backgrounding hides it. Previous/Next
  navigate only available panels. An open panel stays pinned as later ones unlock.
  Replay moment opens a separate muted source window in the side panel; Back returns to the selected comic panel. Closing the comic restores full-screen watching without changing playback. See the
  [TV guide](../tv-learning/README.md) for the private debug build setup.
- **Optional warm-up:** below the home event list, Calentemos opens three existing,
  illustrated vocabulary cards for Football or F1. These are general sport phrases,
  not analysis of an upcoming match. English is available on hold. Next/Previous
  navigate and Back/Done exits. No completion, timer, score or match-unlock gate is
  introduced. More options, home import/add forms and the fictional story entry
  were removed at the user's request. Existing saved-session data and underlying
  recap/import functionality remain; there is no new home import control.

The default TV animation never offers the Alba comic. The Android phone collection opens directly from the home review action, as
requested on 21 October. There is no intermediate spoiler-confirmation screen;
this does not establish synchronised watch progress.
The pending Marina Bay race remains pending; its warm-up does not create race cards.

## Sources and verification

Original generated PNGs and full prompts are retained in
[artwork/comic](artwork/comic/README.md). No broadcast frame was used in generation.
The original files remain unchanged; native image rendering also selects detail
crops for the boot/ball and goal inserts. All language remains native UI text.

- `native/commonMain/ComicRecap.kt` and its common test own the Alba selection and
  source-time boundaries, including future-panel suppression and rewind.
- `native/androidMain/ComicRecapReader.kt` and `native/androidTest/ComicRecapTest.kt`
  cover the phone reader, real touch hold/release/cancel, accessibility disclosure,
  lifecycle reset, local replay and exit.
- `../tv-learning/native/androidTest/TvComicTest.kt` covers the real TV player and
  remote: no early panels, no forced opening, pinned selection, hold/release,
  available navigation and preservation of explicit paused/playing state.
- `../recap/native/androidTest/WarmupTest.kt` covers optional access, translation,
  both sports, exit and the absence of the removed home section. Existing recap
  journeys seed saved-session fixtures instead of recreating removed home controls.

Local screenshots/logs live in ignored
`app/content-source/match-analysis/comic-prototype/`; TV captures include private
broadcast footage. Physical Fire TV, TalkBack usability, fluent Spanish review and
learning effectiveness remain unverified. The previously documented phone route
reset on activity recreation remains open; this change does not repair the whole
navigation stack. iOS and XR do not receive this native Android reader.

## Continuous-scroll refinement · 21 October

Android opens the match collection directly from home. The comic now uses angled
gutters, overlapping cream captions, boot/ball and goal close-ups, and one
continuous scroll without page controls. Eight affected Android journeys passed
on the API 36 emulator; the comic journey passed again after the final crop
refinement. These cover direct entry, back navigation, saves, hold/release/cancel,
accessible translation, replay and optional warm-up. Actual start/finish captures
and logs are in ignored `app/content-source/match-analysis/comic-refinement/`.
TV, iOS and physical-device acceptance were not rerun for this Android-only change.

The subsequent first-card passing playground is owned by [the warm-up feature](../recap/WARMUP.md), separate from the continuous comic reader.

## Stadium replay · 21 October

The phone uses a thin lavender rounded outline and translucent navy surface over
the comic, with native title/close controls and uncropped 16:9 video. Expansion
keeps the same player; dismissal releases it without scrolling the comic.
`StadiumReplayTest` covers play/pause/repeat, expansion, background pause, Back
and close, video aspect ratio and preservation of the story position. The existing
comic and card-replay journeys also pass on the API 36 emulator. Actual captures
and logs are retained in ignored `app/content-source/match-analysis/stadium-replay/`.

## Mobile comic identity · 22 October

The Android home uses the source-matched Alba cover for Barcelona vs Madrid;
other events keep their own sport cover. Moment selection now uses large
illustrated panels. All six football cards and their practice scenes share the
manhwa assets via `comicMomentArtwork`; the Madrid run/cross/volley illustrations
are new, with prompts and corrections in the artwork record. Thin navy frames,
cream native captions and quieter corners connect cards, stories and warm-up.
The continuous reader, hold interactions, explicit standard-card translation,
local saves and independent stadium replay retain their existing behavior.

Verification: Android debug/instrumentation builds and 11 API 36 phone-emulator
interaction tests passed; the five home/match tests passed again after final
artwork replacement. The 22 captures and logs are in ignored
`app/content-source/match-analysis/mobile-comic-2026-10-22/`. See the
[dated visual audit](../../../../docs/design/tv-mobile-2026-10-20/vega-audit.md)
for scope and remaining TV findings. Physical devices were not retested.


### Replay rendering correction · 22 October

The previous gallery captured the native surface before its first decoded frame;
video did render when given time. A playback status alone was insufficient
screenshot evidence. The player now keeps a loading message until the rendering
callback. The stadium dialog has a thin translucent rim with a solid navy content
surface, a quieter title/close row, wider 16:9 video and a single control row, so
comic captions cannot bleed through the controls. Expansion, dismissal, background
pause and the underlying scroll position retain their behavior.

Android app/test builds and three API 36 emulator journeys passed
(`StadiumReplayTest`, `MatchReplayTest`, `ComicRecapTest`). The stadium test checks
visible green pitch pixels from the private fixture as well as ratio, controls,
replay and dismissal. Updated capture: ignored
`app/content-source/match-analysis/mobile-comic-2026-10-22/stadium-replay-fixed.png`;
`replay-render-tests.log` records the run. The old capture remains as historical
evidence. No physical-device or Vega rendering conclusion follows from this fix.
