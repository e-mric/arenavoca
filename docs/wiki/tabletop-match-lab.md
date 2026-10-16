# Tabletop Match Lab

Reviewed: 2026-10-16

## Why the user requested it

The user wants to act out Spanish instructions on a miniature football pitch or F1 circuit, using small characters and cars. This makes spatial manipulation part of the learning task: understanding a pass, save, overtake, or pit entry produces a visible action in the world. The benefit to retention remains a hypothesis; it needs learner testing.

The [PRD tabletop section](../../PRD.md#tabletop-match-lab-direction--16-october-2026) owns the action catalogue, draft Spanish, completion rules, and interaction requirements. The [roadmap](../SUBMISSION_ROADMAP.md#tabletop-match-lab-delivery) owns delivery order. These are planned additions. The existing [cutback rules](../../app/src/features/match-lab/lab.ts) and [board asset](../../app/src/features/match-lab/lab.scene-asset.ts) implement a narrower selectable-marker activity.

Start with one satisfying football exercise, then extend the same learning loop to F1. Keep input handling, action validation, and animation separate: a pretty animation does not prove the learner executed the correct action. Tests should distinguish a backward pass from a forward one, a shot from a goal, and a legal overtake from placing a car ahead. Translation help should be optional and measurable, while input assistance should keep the task accessible.

## Drawcall as a candidate authoring tool

Primary sources inspected 16 October 2026: [Drawcall overview](https://drawcall.ai/), [Codex connection guide](https://drawcall.ai/docs/connect-to-ai-agent/codex/), and [GLTS repository](https://github.com/drawcall-ai/glts). Product claims are from the publisher; no Drawcall project or ArenaVoca integration was tested in this review.

- **Design:** the advertised shared visual/source workspace could help Emeric adjust miniature pitch proportions, player silhouettes, car shape and materials while Codex works on the source. This fits the learning goal of participating in visual decisions.
- **Market:** reusable assets may be useful references, but our current asset requirement remains original, source-controlled content. Do not replace that with downloaded third-party kits by default; review provenance and compatibility before any proposed reuse.
- **GLTS:** editable procedural Three.js source could suit a coherent family of small players, goals, cars and pit furniture. The format runs executable TypeScript; treat it as code to review, not an inert mesh import. It is not automatically compatible with our asset lifecycle.
- **Runtime tools:** Drawcall's [vitexec](https://github.com/drawcall-ai/vitexec) advertises inspection of Vite/Three.js applications. Compare it against existing IWSDK tools only if a concrete inspection need remains; do not add a parallel toolchain solely because it is available.

The GLTS repository documents a Three.js r185 requirement for its current physics integration, while ArenaVoca's existing dependency set is pinned separately. It also states that XR is outside V1 of its rendering-profile layer. This does not establish that all GLTS geometry is unusable in XR; it means we must test the asset boundary rather than replace IWSDK's renderer, physics, or input. Keep SDK versions together and follow the existing manifest/asset lifecycle.

Suggested bounded trial: one original football figure and a pitch with a consistent toy-like style; inspect/edit them in the authoring workspace, then prove one asset can be integrated into the current IWSDK scene without changing the framework. Compare geometry cost, materials, dimensions, animation ownership, and actual Quest performance. Prefer adapting reviewed original source into the existing procedural-asset pattern if that avoids another runtime dependency; a lossless export path has not been verified.

No account was connected, software installed, asset purchased/generated, or private match material uploaded. Current paid-generation availability should be checked before depending on it; the reviewed homepage labels Pro as coming soon. Original IWSDK procedural assets remain a viable path if the trial adds more complexity than value.

## Open checks

- Does tabletop action improve comprehension and recall compared with flipping a card alone?
- Can the learner operate the pieces comfortably while seated, in both theater and passthrough?
- Can original characters remain visually coherent across football and F1 without costly animation or physics?
- Can Drawcall output integrate cleanly with the pinned runtime and source-control requirements?

See [immersive lessons](immersive-lessons.md) for the physical test boundary, and [recognition](recognition.md) for why authored exercise rules must remain separate from uncertain model observations.
