# Vega screen review and mobile comic direction

Reviewed: 2026-10-22.

## Approved refinement implemented

The user approved the generated [Watch / Moments / Learn board](vega-approved-proposal.png)
([generation prompt](vega-proposal-prompt.txt)). Vega now uses three main controls,
compact illustrated moment rows, matching Alba manhwa artwork, Spanish with
optional English beneath it, and a fixed return footer. Save and recall remain
reachable. The default match stays full screen; learning opens only on request.

The end-of-stream scaling issue is addressed by displaying the exact clip’s
extracted final frame over the still-mounted player only after playback ends.
Closing a panel no longer leaves a smaller frozen image. Learning never seeks or
resumes the video. This is an SDK display workaround, not a native-player fix.

Verification: both Alba Debug and original-media Release passed the updated
remote journey and paused cold-launch checks on the official 1920×1080 VVD.
The regression checks actual full-screen edge pixels and before/after output,
not only container dimensions. Native typecheck, both builds and package hashes
passed. The app check passed 321 tests, typecheck and production build (existing
bundle-size warning). Current evidence is in the ignored local gallery
`app/content-source/match-analysis/vega-design-implemented-2026-10-22/index.html`.

The original audit below is retained as the before-state. Physical viewing
distance, 720p, screen-reader usability and long translations remain unverified.
Comic scrolling/replay, phone sync and live recognition are outside this Vega pass.

## Scope and evidence

Impeccable native visual critique: one assessment, browser detector not applicable.
Inspected the actual official Vega Virtual Device at 1920 × 1080 using Appium
remote keys, screenshots and accessibility trees, plus the
[Vega source](../../../app/src/features/tv-learning/vega/App.tsx).
This is simulator evidence, not physical-TV or screen-reader acceptance.

The local gallery is `app/content-source/match-analysis/vega-design-audit-2026-10-22/index.html`.
Unmodified PNGs and paired XML trees cover all seven implemented routes: watch,
controls, moments, saved, card, recall and about. Captures include all three cards
in both languages, empty collections, saving, incorrect/correct recall and natural
playback completion. Loading, playback failure and storage failure were not forced.
Private recording pixels remain in ignored local evidence, outside Git.
The capture script initially failed only while restoring a final viewing position
after restart; a follow-up waited for the seek before restoring the cutback.
The restart-transition image is not evidence of paused playback.

Compared with the actual Android comic, interactive warm-up and stadium-replay
captures and source, rather than treating generated proposals as implemented UI.
See [comic behavior](../../../app/src/features/stories/COMIC.md) and
[warm-up behavior](../../../app/src/features/recap/WARMUP.md).

## Verdict

The palette belongs to ArenaVoca; much of the TV layout still resembles a generic
stack of buttons. Its strongest property is uninterrupted football with deliberate
access to learning. The next design pass should bring the mobile illustration and
caption treatment into that structure without turning live viewing into a comic.

Strengths: full-screen default watching; highly visible blue/coral remote focus;
short source-matched phrases and honest local-save/provider limits. Three choices
make recall manageable. Empty states explain what to do next.

## Original priorities — before the approved refinement

| Priority | Finding and evidence | Recommended change |
| --- | --- | --- |
| P1 | Returning from a side panel at the end leaves the visible frozen video smaller than the full-width watch container (finished/control captures). Ordinary paused return was subsequently captured at full size; the anomaly is at playback completion. Layout bounds alone did not prove native video scaling. | Reproduce paused/end-of-stream surface resizing and fix it without resuming or seeking the match. Assert rendered output, not only wrapper width. |
| P2 | Save adds Practise, pushing All moments below the initial viewport; recall also partly clips Back to card. These remain reachable by remote scrolling. | Keep return/navigation outside the scrolling body. Make Saved a status rather than another full-width action. |
| P2 | Six equal-weight controls compete with watching. Restart and Watch again are redundant at the end. | Prioritize playback, Moments and Saved. Move About into collection details; use the remote Back convention for dismissal with a concise hint. Keep restart as an explicit secondary playback action. |
| P2 | Small detached thumbnails sit above large pills. The selected card uses older simplified art and has weaker visual continuity with mobile. | Use source-matched manhwa art, a native cream ink-framed caption, and compact illustrated collection rows. Preserve the approximate 28% panel width and uncropped video. |
| P2 | Meaning replaces Spanish entirely, and recall becomes text-heavy without the action illustration. | Consider English beneath Spanish on explicit remote activation, with a toggle alternative to holding. Retain a small action illustration in recall and reveal only relevant feedback. This behavior change needs approval and regression checks. |

The new-moment screenshot captured uninterrupted play rather than the transient
invitation itself. Its absence in that single screenshot does not prove a notice
failure. Notice timing/discoverability deserves a separate short usability check.

## Heuristic review

Scores are design judgment (0–4), not a certification. Unexercised fault recovery
is left unscored rather than inferred from source.

| Heuristic | Score | Evidence / limitation |
| --- | --- | --- |
| System status | 3 | Playback time/state, saved count, recall feedback visible. |
| Match to real world | 3 | Clear football terms; generic Meaning can be clearer. |
| User control | 3 | Back and explicit playback work; long panels obscure return actions. |
| Consistency | 2 | TV has older artwork and different translation presentation. |
| Error prevention | 3 | Timed cards and explicit playback; duplicate restart affordances. |
| Recognition over recall | 2 | Strong illustrations in cards, none in recall; hidden return action. |
| Efficiency | 2 | D-pad works; controls and scrolling add unnecessary navigation. |
| Minimal presentation | 2 | Six controls, repeated headings and oversized pill stack. |
| Error recovery | n/a | Playback/storage failures not induced in this capture pass. |
| Help | 3 | Empty-state instructions and About; contextual remote hints could improve. |

Total: **23/36**. Cognitive load is low while watching, rises at the six-control
bar and after saving. Emotional flow peaks with the real action, then becomes
flatter in the text-only recall screen. First-time viewers may miss why cards
are unavailable; repeat users face extra D-pad movement; low-vision viewers need
physical-distance testing and a pinned exit. No P0 blocker observed.

## Mobile implementation in this turn

The user subsequently asked to commit to the comic/manhwa direction on mobile.
Android now uses the Alba illustration as this match's cover, larger illustrated
moment selections, thin navy frames and shared native caption panels. All six
football moments map to source-matched manhwa artwork; the first three panels were
newly generated. The cross composition was rejected by the user and replaced with
a closer sideline view. [Generation provenance](../../../app/src/features/stories/artwork/comic/README.md)
records prompts and limitations. Other events never inherit the Alba cover.

Continuous scrolling, comic caption holds, optional warm-up object/flick controls,
local saving and independent stadium replay remain. Standard match cards retain
their explicit Show meaning toggle. The pending F1 race remains pending, with its
existing sport illustration; this pass does not invent F1 comic race content.
The original illustrations remain available to other targets.

## Next verification

The approved refinement addresses end-frame sizing, visible return controls and
visual consistency. Next check 720p, physical couch
distance, screen-reader announcements and long translations separately. Comic
recaps and warm-up are not yet Vega routes. Questions skipped: the user already
selected the comic direction; this audit does not authorize a broader Vega redesign.

## Verification completed

- Android debug app and instrumentation APK builds passed with JDK 17.
- API 36 phone emulator (`emulator-5556`): 11 tests passed across home, match
  moments, continuous comic, stadium replay, passing interactions and optional
  warm-up. After the final artwork replacement, the five home/match tests passed
  again. These are 11 distinct tests, with five repeated for final assets.
- The 22 mobile captures and test logs are in ignored
  `app/content-source/match-analysis/mobile-comic-2026-10-22/`; its `index.html`
  records capture scope. The Vega gallery contains 24 captures across seven routes.
- `npm run check` passed: typecheck, 321 tests in 56 files, production build.
  Dependency annotation and bundle-size warnings remain. No web behavior changed;
  native instrumentation is the affected UI verification for this pass.
- Documentation link/workflow checks and `git diff --check` passed.
- Vega findings are an audit, not fixes. No physical phone, Fire TV or Quest
  acceptance is established by these emulator checks.
