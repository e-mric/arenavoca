# Impeccable audit: implemented Android companion

Reviewed: 2026-10-20. Native `audit` playbook, Android platform reference. Scope: current home, event collection, match cards, replay, stories and secondary vocabulary/import flows. This is a source-level technical audit supplemented by actual emulator inspection; the [earlier TV audit](audit.md) is separate. No fixes were made during this audit phase. The preceding approved redesign and its tests are distinct from this report.

## Platform conformance verdict

**Pass for native foundations; not release-ready.** This is a Compose/Material app with native buttons, chips, text fields, system Back handlers and safe drawing insets. It does not behave like a webpage wrapped in an app. However, rotation drops the current learning route, system dark appearance is ignored, and the bookmark affordance does not support removal.

## Audit health score

Scores are provisional engineering judgements, not measured usability or accessibility certification. Unmeasured hardware performance and TalkBack behaviour are explicitly excluded.

| # | Dimension | Score | Key finding |
| --- | --- | --- | --- |
| 1 | Accessibility | 3/4 | Core controls labelled, adequate observed targets and contrast; disclosures lack expanded/collapsed semantics; TalkBack not exercised |
| 2 | Performance | 2/4 | Event history composes eagerly; large artwork also serves thumbnails; legacy progress commits synchronously |
| 3 | Appearance & theming | 2/4 | Strong consistent brand scheme, but only a light scheme and some raw component colours |
| 4 | Platform conformance | 3/4 | Material controls and Back work; saved bookmark remains a save-only action |
| 5 | Adaptivity | 2/4 | Portrait and checked 1.3 font views fit; rotation resets route; no distinct expanded/foldable layout |
| **Total** | | **12/20** | **Acceptable: significant hardening remains** |

Seven technical findings: **0 P0, 1 P1, 5 P2, 1 P3**. Priority: preserve learning on recreation, improve disclosure semantics, then address appearance and growth/performance. Do not replace the approved palette or artwork.

## Evidence and limits

- Source: `MainActivity.kt`, `ReviewEventCard.kt`, `Playmaker.kt`, `MatchMoments.kt`, `StoryReader.kt`, `MatchReplayView.kt` and `ImportRecap.kt` in the recap/stories native Android source folders.
- Pixel 7 API 36 emulator: actual accessibility layouts and captures. Main actions measured at 48 dp or greater in the inspected layouts (126 px at 2.625 density). This does not certify every target in every configuration.
- 37 shared tests and 13 Android journeys pass. Four affected match-navigation tests pass after final tab sizing; the new tabs/next-card journey also passes at system font scale 1.3. Rotation and dark-mode findings were observed manually afterward, outside those passing cases.
- Reproduction: open football → reveal → select cutback (5/6) → rotate to landscape. The app returns to Home. `audit-landscape-reset.png` captures the result.
- `cmd uimode night yes` leaves the home cream/light; `audit-system-dark.png` records that. Original night mode, rotation and font scale were restored.
- Calculated token contrast: white on blue `#1646ED` **6.70:1**; navy `#142352` on cream **14.52:1**; secondary text `#4E5268` on lavender **6.41:1**. This checks those solid colour pairs, not every rendered state or disabled control.
- Local screenshot atlas: `app/content-source/match-analysis/mobile-screen-audit/implemented/index.html` and `gallery.md`. PNGs are unchanged app captures; generated proposals are separate. Main routes and important states are included, not every file-picker/error permutation.
- Samsung SM_F971B: installation and foreground launch confirmed only. No physical instrumentation server/test was installed. TalkBack, switch access, actual fold/unfold, cold-start timing, frame traces and full device acceptance remain unverified. No new TV or iOS UI acceptance is claimed.

## Detailed findings

### [P1] Rotation loses the current card, route and unfinished lesson

**Location:** `MainActivity.kt:34–42`; `MatchMoments.kt:53–60`; `StoryReader.kt:29–35`. **Category:** Adaptivity / platform lifecycle.

The route, card and lesson use ordinary `remember`. A real rotation from cutback card 5/6 returned to the home screen. Lesson answers are also transient by source inspection; answer loss was not separately reproduced. Users can lose their place during ordinary rotation, resizing or activity recreation. Saved cards survive, which does not preserve an unfinished lesson.

**Recommendation:** retain route identifiers, selected card, panel/stage and draft answers using saved state/ViewModel with an explicit story-state contract. Keep replay lifecycle safe; do not automatically restart audio. Add a recreation test from an open translated card and an unfinished answer. **Suggested command:** `$impeccable harden`.

### [P2] Disclosures omit their expanded state for assistive technology

**Location:** `StoryReader.kt:50,72`; `MatchMoments.kt:36,143,150`. **Category:** Accessibility.

Story details, Phrase help, About this match and Card details toggle content without announcing expanded/collapsed state. Core icon labels exist, but a screen-reader user cannot tell whether these stable-label controls are open from the control semantics. Source and accessibility tree establish the missing state; actual TalkBack focus behaviour is unverified.

**Recommendation:** add expanded/collapsed state semantics, appropriate grouping and headings; inspect focus/read order and newly revealed feedback with TalkBack. Keep short labels. **Suggested command:** `$impeccable harden`.

### [P2] Dark appearance has no supported scheme

**Location:** `Playmaker.kt:26–35`, `MainActivity.kt:25–27`. **Category:** Appearance & theming.

`lightColorScheme` is unconditional and system-bar appearance is fixed. Enabling Android night mode leaves the same bright screen, which is especially noticeable during evening sports viewing. This is not a contrast failure in the current light palette. Dynamic wallpaper colour is not demanded: retaining the user's brand palette is intentional.

**Recommendation:** build a brand-preserving dark scheme and matching system-bar treatment, or expose an explicit documented appearance preference. Replace raw per-card colours with semantic roles that support both schemes. **Suggested command:** `$impeccable colorize`.

### [P2] Event history eagerly composes full artwork for every game

**Location:** `MainActivity.kt:57,143`; `Playmaker.kt:53–55`; `MatchMoments.kt:130–136`. **Category:** Performance.

Home uses a scrolling Column and `events.forEachIndexed`, so growing the user-requested game history creates all cards at once. Six current match illustrations are 1536×1024 PNGs (~1.3 MB compressed each); the same painter resource is used for 76 dp thumbnails without an explicit thumbnail decode path. This is a concrete scaling risk, not a measured current jank claim. The 53 MB debug APK is not representative of release size.

**Recommendation:** use a keyed LazyColumn for history, appropriate thumbnail derivatives or size-aware image loading, and measure startup/scrolling with representative history before adding complexity. **Suggested command:** `$impeccable optimize`.

### [P2] Legacy recap persistence blocks the UI thread

**Location:** `MainActivity.kt:43–45`. **Category:** Performance.

The general vocabulary/quiz path serializes progress and calls SharedPreferences `commit()` synchronously inside UI event handling. This can stall rendering on slow storage or a larger collection. Match-card saving already moves its commit to `Dispatchers.IO`; import file reading also runs off the UI thread. No millisecond regression is claimed without a trace.

**Recommendation:** apply the existing off-main-thread pattern to recap persistence with explicit failure feedback and controlled concurrent writes. **Suggested command:** `$impeccable optimize`.

### [P2] Filled bookmark cannot remove a saved match card

**Location:** `MatchMoments.kt:78–88`. **Category:** Platform conformance / control behaviour.

Pressing the filled “Saved” bookmark still computes `saved + card.id`; it never removes the item. The Saved tab has no removal action. Users can save accidentally but cannot curate that collection, while the older vocabulary buttons do support removal.

**Recommendation:** make the bookmark a labelled save/remove toggle with clear state feedback and persistence coverage, or provide an explicit remove action in Saved. **Suggested command:** `$impeccable harden`.

### [P3] Card provenance takes two disclosures to reach

**Location:** `MatchMoments.kt:36,107,150`. **Category:** Platform conformance / navigation clarity.

Card details first reveals a separate “Why this card?” toggle. A user who already requested details has to request them again before seeing evidence.

**Recommendation:** use a single details disclosure or sheet containing provenance. Keep the main card quiet. **Suggested command:** `$impeccable polish`.

## Visual observations supporting the user's brief

These are design judgements, not additional scored technical defects:

- The new single-card view has a clear hierarchy: large art → one phrase → meaning → Next. Preserve this; empty space need not be filled with more information.
- The six-row moment list is easier to scan than repeated large cards. Cards/Stories/Saved remain visible at the checked font scale.
- General vocabulary collection still mixes a recap CTA, a story promotion, saved count and bilingual grid. Reflection combines instructions, a disabled answer, model answer, transfer example and self-assessment. These older flows are the next candidates for reducing density without removing instructional meaning.
- The home hero now carries the essential event name, date and counts. A large game history could use compact older-game rows while preserving the latest hero.
- The cutback artwork depicts a spatial setup more clearly than motion. The proposed reusable action library should include ball-direction and timing variants; recolouring alone will not make the action clearer.

Mobbin inspiration and the approved generated reference remain in the [design record](README.md). Aesthetic familiarity does not establish learning benefit or lower fatigue.

## Patterns and positive findings

The main systemic gap is state/lifecycle handling: presentation state lives locally in composables rather than in a restorable route/lesson model. A second gap is uneven application of the newer layout and persistence practices to older vocabulary flows.

Keep the existing strengths: Material controls/type roles, generous touch areas, good checked text contrast, explicit translation, spoiler protection, honest pending F1 content, no fake live badge, local-save feedback, off-main-thread match-card/import IO, and replay cleanup on lifecycle/disposal. No decorative large-motion feature requires a reduced-motion alternative in the audited new layouts.

## Recommended actions

1. **[P1/P2] `$impeccable harden`** — restoration first, then disclosure semantics and removable bookmarks; verify TalkBack and keyboard paths.
2. **[P2] `$impeccable adapt`** — landscape/expanded/foldable layouts and 2.0 text scale after state restoration. No foldable acceptance yet.
3. **[P2] `$impeccable colorize`** — brand-preserving dark appearance and semantic component colours.
4. **[P2] `$impeccable optimize`** — lazy history, thumbnail sizing and asynchronous recap persistence, supported by profiling.
5. **Design follow-up: `$impeccable distill`** — the older vocabulary and reflection layouts, retaining required learning content.
6. **[P3] `$impeccable polish`** — one-step provenance and final spacing after the functional work.

You can ask me to run these one at a time, all at once, or in any order you prefer. Re-run `$impeccable audit` after fixes to reassess the score.
