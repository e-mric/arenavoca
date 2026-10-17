# Current project state

Reviewed: 2026-10-17 against PRD, current source, Git and the linked evidence. Product implementation baseline: [`96f422c`](https://github.com/e-mric/arenavoca/commit/96f422c). This page owns the current handoff; the [PRD](../PRD.md) owns requirements and the [roadmap](SUBMISSION_ROADMAP.md) owns submission dates/deliverables.

## Milestone and accepted scope

Deliver a comfortable recorded-football viewing and optional Spanish-card loop on Quest 3, supporting the two planned submissions. The intended first audience is sports fans beginning Spanish, including seated users new to hand interaction. [Personas](PERSONAS.md) are fictional hypotheses, not participant research.

Accepted: curved match screen; My room/Quiet space; timed optional cards; Replay, Listen, Save and flip for translation; persistent palm menu with explicit close; movable/resizable screen and card. Main playback remains independent. Tabletop play and physical phone/printed cards are deferred. F1 is an existing practice pack/future expansion; the YouTube demo is retired.

## Confirmed implementation and limits

| Capability | Source / limit |
| --- | --- |
| Prepared cards arrive from recording time; selected card stays pinned | [Delivery](../app/src/features/match-moments/delivery.ts), [arrival](../app/src/features/match-moments/arrival.ts); seven selected action moments, not continuous recognition |
| Historical pregame cards, optional actions and local save | [Pregame](../app/src/features/match-moments/pregame.ts), [card actions](../app/src/features/match-moments/card-actions.ts); historical 2018 notes, not live news; unavailable audio/replay is labelled |
| Persistent palm menu and resize-following card handles | [Gesture state](../app/src/features/match-moments/gesture-menu.ts), [spatial windows](../app/src/features/spatial-windows/windows.ts); latest fixes need physical Quest retest |
| Android/iOS companion with local practice and manual recap transfer | [Native setup](../README.md#native-kmp-companion-first-slice); automatic cross-device save sync remains unimplemented |
| Local recognition adapter and bounded Windows experiments | [Recognition evidence](wiki/recognition.md), [trial report](WINDOWS_LOCAL_AI_2026-10-16.md); timing/action errors and latency remain; no successful full-game benchmark or live-ready claim |

## Dated verification

- **17 October, `96f422c`:** recorded typecheck, 297 unit tests, production build and 16 affected browser tests passed. Emulator checks covered handle movement/resizing/release and proportional spacing. Source: [card-handle correction](QUEST_REVIEW.md#card-handle-spacing-correction--17-october-2026). These are previous run results, not tests rerun by this workflow setup.
- **17 October, earlier card revision:** 35 browser tests passed, two skipped; this was before the latest handle fix. [Card-only evidence](QUEST_REVIEW.md#card-only-match-moments--17-october-2026--quest-acceptance-pending) records its narrower physical acceptance status.
- **16 October, local inference:** real Windows trials are recorded separately from fixtures in [the trial report](WINDOWS_LOCAL_AI_2026-10-16.md). Schema validity and a successful request do not establish action accuracy.
- **17 October, workflow setup:** Matt Pocock marketplace/plugin verified installed and enabled at 1.3.1. Twelve Markdown pages / 171 local links and anchors, four workflow-tooling tests, workflow YAML syntax and final diff passed review. App-command dispatch tests use a fake npm executable; they do not rerun or prove the app checks. New CI is configured; no hosted CI run is claimed. App/mobile/Quest suites were not rerun for this documentation/tooling change.

## Blockers and decisions

- Physical Quest acceptance remains open for palm placement, persistent menu, card/screen grab/resize, finger selection and switching spaces. User screenshots prompted fixes; emulator success does not close those reports.
- Prototype Spanish and pronunciation need fluent review. Learning benefit, retention and comfort have not been established with participants.
- The local full-match recording is private benchmark material, not cleared public demo content. A fresh checkout needs the private file or `?sample=1`. Public rights/branding clearance and an original demo sequence remain release blockers.
- **Open decision:** the bounded public demo and its success criteria. The PRD's active card design supersedes older tabletop/practice descriptions still preserved in historical sections.
- **Proposal:** prioritize reviewed prepared cards for the first accepted Quest demonstration while measuring local AI separately. This is a recommendation, not a new approved product decision. The roadmap owns the demonstration-mode checkpoint.
- CI initially covers web automation and documentation; native builds/UI, Python provider checks, actual model runs and headset checks remain separately invoked. Private-media browser tests can skip in clean CI; a green run is not full-match or device acceptance.

## Next handoff

**Goal:** accept one comfortable watch → notice → open → replay/listen → flip → save loop without disrupting the match.

**Completed:** rounded card/menu design, timed invitations, persistent controls, space switching and closer resize-following handles are implemented and committed. Shared guidance, skill routing and chat starters now provide the workflow foundation.

**Next:** (1) confirm the public demo slice and observable success criteria; (2) run the latest [Quest cases](QUEST_REVIEW.md) with the user and record pass/fail/not-tested evidence; (3) resolve content/language review before public claims; (4) keep recognition evaluation bounded and separately measured.

**Relevant files:** `app/src/features/match-moments/`, `app/src/features/spatial-windows/`, approved design and Quest review above. **Needs:** physical headset participation, fluent reviewer and public-content decision. No autonomous publication, submission or extra chat creation is implied.

When handing off, replace this current situation with the new goal/completed/remaining/files/blockers/verification. Preserve detailed evidence at its source and use Git for ordinary edit history.
