# Tabletop Match Lab

Reviewed: 2026-10-16

## Why the user requested it

The user wants to act out Spanish instructions on a miniature football pitch or F1 circuit, using small characters and cars. This makes spatial manipulation part of the learning task: understanding a pass, save, overtake, or pit entry produces a visible action in the world. The benefit to retention remains a hypothesis; it needs learner testing.

The [PRD tabletop section](../../PRD.md#tabletop-match-lab-direction--16-october-2026) owns the action catalogue, draft Spanish, completion rules, and interaction requirements. The [roadmap](../SUBMISSION_ROADMAP.md#tabletop-match-lab-delivery) owns delivery order. The pass/shot slice is implemented below; the wider action catalogue remains planned. The existing [cutback rules](../../app/src/features/match-lab/lab.ts) and [board asset](../../app/src/features/match-lab/lab.scene-asset.ts) implement a narrower selectable-marker activity.

Start with one satisfying football exercise, then extend the same learning loop to F1. Keep input handling, action validation, and animation separate: a pretty animation does not prove the learner executed the correct action. Tests should distinguish a backward pass from a forward one, a shot from a goal, and a legal overtake from placing a car ahead. Translation help should be optional and measurable, while input assistance should keep the task accessible.

## Drawcall as a candidate authoring tool

Primary sources inspected 16 October 2026: [Drawcall overview](https://drawcall.ai/), [Codex connection guide](https://drawcall.ai/docs/connect-to-ai-agent/codex/), and [GLTS repository](https://github.com/drawcall-ai/glts). Product claims are from the publisher; the initial investigation did not test integration; the subsequent local export trial is recorded below.

- **Design:** the advertised shared visual/source workspace could help Emeric adjust miniature pitch proportions, player silhouettes, car shape and materials while Codex works on the source. This fits the learning goal of participating in visual decisions.
- **Market:** reusable assets may be useful references, but our current asset requirement remains original, source-controlled content. Do not replace that with downloaded third-party kits by default; review provenance and compatibility before any proposed reuse.
- **GLTS:** editable procedural Three.js source could suit a coherent family of small players, goals, cars and pit furniture. The format runs executable TypeScript; treat it as code to review, not an inert mesh import. It is not automatically compatible with our asset lifecycle.
- **Runtime tools:** Drawcall's [vitexec](https://github.com/drawcall-ai/vitexec) advertises inspection of Vite/Three.js applications. Compare it against existing IWSDK tools only if a concrete inspection need remains; do not add a parallel toolchain solely because it is available.

The GLTS repository documents a Three.js r185 requirement for its current physics integration, while ArenaVoca's existing dependency set is pinned separately. It also states that XR is outside V1 of its rendering-profile layer. This does not establish that all GLTS geometry is unusable in XR; it means we must test the asset boundary rather than replace IWSDK's renderer, physics, or input. Keep SDK versions together and follow the existing manifest/asset lifecycle.

Suggested bounded trial: one original football figure and a pitch with a consistent toy-like style; inspect/edit them in the authoring workspace, then prove one asset can be integrated into the current IWSDK scene without changing the framework. Compare geometry cost, materials, dimensions, animation ownership, and actual Quest performance. Prefer adapting reviewed original source into the existing procedural-asset pattern if that avoids another runtime dependency; a lossless export path has not been verified.

At the initial research stage, no account was connected, software installed, asset purchased/generated, or private match material uploaded. Current paid-generation availability should be checked before depending on it; the reviewed homepage labels Pro as coming soon. Original IWSDK procedural assets remain a viable path if the trial adds more complexity than value.

## Local export and interaction trial

What we expected → Drawcall could supply editable original characters and a pitch without replacing IWSDK.

What happened → the installed CLI did not offer `design`. Sign-in succeeded, but AI generation returned HTTP 403 for missing generation entitlement. Original procedural assets were authored with GLTS and exported to static GLB instead. The source and exports are retained; see [asset notes](../../app/content-source/drawcall/README.md). No private match footage was uploaded.

What we learned → the useful boundary is asset authoring/export. IWSDK continues to own rendering and input, and deterministic [practice rules](../../app/src/features/match-lab/tabletop.ts) evaluate passes and shots. A separate selection ring makes distance selection work alongside near grabbing. This is assisted target placement, not realistic throwing or an inferred reconstruction.

Evidence → emulator controller grabbing/release completed the pass; ray selection and the spatial Next button completed pass then shot. Automated browser checks preserve playing and paused match states and the pinned card. The [Quest checklist](../QUEST_REVIEW.md#tabletop-pass-and-shot--16-october-2026--device-acceptance-pending) separates these checks from physical hand tracking, sizing, performance and comfort, all still pending. Spanish remains provisional.

Next check → Emeric tries both actions, move/resize and recovery in theater and passthrough on Quest 3 before expanding the action set.

## Open checks

- Does tabletop action improve comprehension and recall compared with flipping a card alone?
- Can the learner operate the pieces comfortably while seated, in both theater and passthrough?
- Can original characters remain visually coherent across football and F1 without costly animation or physics?
- The static GLB export loads in the pinned runtime; does its visual quality and performance hold up on the physical Quest?

See [immersive lessons](immersive-lessons.md) for the physical test boundary, and [recognition](recognition.md) for why authored exercise rules must remain separate from uncertain model observations.


## Minimal interaction revision

**Decision, 16 October:** take Cubism's restraint and Demeo's tangible pieces as design references. Two cute teammates, one goal, one instruction card; defer the Track Craft-inspired F1 slice. The user's subsequent constraints keep surfaces in the mobile Playmaker palette and figures in the selected team's kit. No cinema scenery is shown during the exercise; passthrough keeps the real room.

**What we expected →** a physical card and a small pull gesture would make practice more direct. **What happened →** controller emulation completed a relocated-player pass and shot; grabbing the card center reached its UI, while grabbing its exposed edge allowed wrist rotation. **What we learned →** UI selection and physical handling need distinct, discoverable areas on the same object. This is an AI-written implementation lesson, not a participant observation or learning-outcome result.

**Evidence →** [implementation record](../IMPLEMENTATION.md), [pure gesture tests](../../app/src/features/match-lab/tabletop-aim.test.ts), and [original model source](../../app/content-source/drawcall/README.md). **Next check →** [Quest checklist](../QUEST_REVIEW.md#minimal-tabletop-revision--16-october-2026--device-acceptance-pending): hands-only edge grabbing, pull distance, resizing, room contrast and simultaneous full-match performance. These remain unaccepted on physical hardware.

## Optional team atmosphere

**Decision, 16 October:** add a small stadium window and team banner beside the exercise, preserving Minimal as a card toggle. This applies the user's Ocean Rift reference as a contained view into a world, without adding an enclosing cinema or room scanning.

**Implementation:** original procedural geometry follows the selected football kit. A successful practice action triggers a brief silent celebration; switching to Minimal cancels it and hides the decorations. Session preference survives closing/reopening practice. Match playback and practice state are independent. Source: [atmosphere asset](../../app/src/features/match-lab/atmosphere.scene-asset.ts), [state tests](../../app/src/features/match-lab/atmosphere.test.ts), and [PRD](../../PRD.md).

**Evidence and next check:** automated playback-preservation tests and managed controller checks are recorded in the [implementation record](../IMPLEMENTATION.md). Physical comfort, hand tracking and simultaneous match performance remain open in the [Quest checklist](../QUEST_REVIEW.md#team-atmosphere--16-october-2026--device-acceptance-pending). The claim that team identity improves engagement is still a hypothesis.
