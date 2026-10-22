# Impeccable native audit — TV and mobile

Reviewed: 2026-10-20

Historical pre-implementation audit. The user later chose to retain the original mobile home and example-first hero, superseding the home-reordering recommendation. The quieter card view and full-screen-first TV flow were authorized; see the [current scope](README.md).

**Native conformance verdict: pass for the inspected prototype scope.** Compose Material controls, TV focus handling, explicit Back behavior and mobile safe insets make these native interfaces. The main product problem is competing information, not web-style controls. Physical Fire TV and assistive-technology acceptance remain open.

Method: Impeccable `audit.native` with the Android reference, existing-design scope. Source review plus Android TV API 34 at 1080p and Pixel 7 API 36 screenshots; TV checked at font scale 1.3 without observed primary-control clipping. Original font setting restored. No profiler, TalkBack session or physical device check was performed. Scores below are provisional review judgments, not accessibility certification.

## Health scores

| Dimension | TV / 4 | Mobile / 4 | Evidence and limits |
| --- | --- | --- | --- |
| Accessibility | 3 | 3 | Labelled controls, visible TV focus; mobile target sizes and selected semantics. TalkBack and transient-state announcements unverified. |
| Performance | 2 | 2 | TV root polling, synchronous preference writes and eager mobile session composition warrant measurement. No measured jank claim. |
| Appearance/theming | 2 | 3 | Existing brand palette is consistent; TV uses direct colors, mobile uses more Material roles. Both are light-only. |
| Platform conformance | 3 | 3 | Native controls, Back and TV remote journey; complete device/platform acceptance remains open. |
| Adaptivity | 2 | 3 | TV uses fixed non-scrolling columns; 1080p/1.3 passed visually. Mobile has width/font fallback and scrolling. Other sizes unverified. |
| **Total** | **12/20** | **14/20** | **TV: Acceptable; mobile: Good**, within this bounded inspection. |

## Findings

Six prioritized findings: P0 **0**, P1 **2**, P2 **4**, P3 **0**. The first two are visual hierarchy findings accompanying the technical audit; they are not platform API violations.

### P1 — Permanent TV chrome competes with the match

- Location: [TvLearningScreen.kt](../../../app/src/features/tv-learning/native/androidMain/TvLearningScreen.kt), lines 80–105 and 137–183.
- Category: visual hierarchy / information density.
- Evidence: the supplied screenshot shows a permanent header, large sidebar, playback status, source description, explanatory sentence, four-button rail and footer. Illustration height is only 80 dp.
- Impact: the main task receives a minority of the visible area while text repeats behavior that can be learned once.
- Recommendation: full-screen default watching, transient optional invitation and a compact user-opened illustrated card. Keep required provenance in a secondary view. This follows the user's explicit priority rather than an asserted Material prohibition.
- Suggested command: `$impeccable distill`, then `$impeccable layout`.

### P1 — Mobile makes the actual-match experience secondary

- Location: [MainActivity.kt](../../../app/src/features/recap/native/androidMain/MainActivity.kt), lines 123–141; [MatchMoments.kt](../../../app/src/features/stories/native/androidMain/MatchMoments.kt), lines 15–23 and 69–73.
- Category: visual hierarchy / progressive disclosure.
- Evidence: phone capture shows the example hero above the actual-match entry; the match reader source displays Spanish, English, hint and timing together.
- Impact: users must scroll past the demonstration to reach their intended match, then parse several levels of explanation simultaneously.
- Recommendation: actual-match collection first, illustration-led tiles, one phrase per view, English through Meaning, extra evidence through Info. Preserve spoiler protection.
- Suggested command: `$impeccable layout`, `$impeccable distill`.

### P2 — TV recomposition and saving need a narrower update path

- Location: [TvLearningScreen.kt](../../../app/src/features/tv-learning/native/androidMain/TvLearningScreen.kt), lines 55–67.
- Category: performance.
- Evidence: a 200 ms loop increments root state; synchronous SharedPreferences `commit()` executes during Save. The loop has no lifecycle-started gate.
- Impact: avoidable UI work and a potential main-thread stall; actual dropped frames have not been measured.
- Recommendation: isolate playback position updates, observe lifecycle and move durable writes off the main thread while retaining honest failure feedback. Measure before claiming a performance improvement.
- Suggested command: `$impeccable optimize`.

### P2 — Mobile history composition scales with the entire history

- Location: [MainActivity.kt](../../../app/src/features/recap/native/androidMain/MainActivity.kt), saved-session loop around line 141 and persistence callback.
- Category: performance.
- Evidence: sessions are eagerly composed in a scrolling Column; persistence is synchronous.
- Impact: a growing history increases composition work. Current small-data smoothness is not a large-history benchmark.
- Recommendation: use lazy history rendering if the supported history warrants it; benchmark representative histories and remove blocking storage from interactions.
- Suggested command: `$impeccable optimize`.

### P2 — Light appearance and direct TV colors limit theming

- Location: [TvLearningScreen.kt](../../../app/src/features/tv-learning/native/androidMain/TvLearningScreen.kt), lines 29–32 and 78 onward; [Playmaker.kt](../../../app/src/features/recap/native/androidMain/Playmaker.kt), lines 21–34.
- Category: appearance/theming.
- Evidence: light schemes are explicit; TV uses direct color assignments throughout.
- Impact: no supported system-dark variant; future contrast adjustments require scattered edits. This is a support gap, not an observed contrast failure.
- Recommendation: semantic brand roles and a deliberate low-light watching surface. Preserve the approved cream cards and brand colors; dynamic color should not overwrite that identity.
- Suggested command: `$impeccable harden`.

### P2 — TV layout needs adaptation beyond the checked configuration

- Location: [TvLearningScreen.kt](../../../app/src/features/tv-learning/native/androidMain/TvLearningScreen.kt), fixed padding and non-scrolling columns at lines 80–105.
- Category: adaptivity.
- Evidence: 1080p at 1.3 font scale remained readable in the checked card. The fixed layout has no explicit compact fallback.
- Impact: 720p, longer translations and larger text are unverified risks, not demonstrated clipping.
- Recommendation: test long content and 720p, allow panel scrolling where necessary, size illustration relative to available space, and retain remote focus visibility.
- Suggested command: `$impeccable adapt`.

## Systemic patterns and positives

Technical explanations currently occupy the same hierarchy as the learning content. Illustrations are strong existing assets but receive too little space on TV. Both problems can be addressed with disclosure and layout rather than a new visual identity.

Preserve: independent match playback; pinned selected cards; native remote controls and focus restoration; local-save failure feedback; the mobile spoiler gate; accessible labelled actions and minimum mobile target sizes; mobile narrow-width/large-font fallback; optional evidence expansion; and the existing coherent palette.

## Recommended sequence

1. `$impeccable distill`: remove repeated always-visible explanations from the primary journey.
2. `$impeccable layout`: enlarge the match, make the card optional, lead mobile with the actual match.
3. `$impeccable optimize`: measure and narrow UI updates/storage work.
4. `$impeccable adapt` and `$impeccable harden`: verify size, font, focus, assistive announcements and theme behavior.
5. `$impeccable polish`: finish spacing, type, focus and illustration consistency after those rules work.

These steps can be requested individually or together. Re-run `$impeccable audit` after implementation; scores should change only with evidence.

The [visual proposal](README.md) records the design and subsequent scope correction. Findings above describe the pre-change source; this score has not been reissued as a post-change certification. Emulator captures remain in ignored `app/content-source/match-analysis/design-audit/`; the private broadcast capture is not copied into documentation.
