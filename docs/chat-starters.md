# Focused chat starters

Reviewed: 2026-10-17

Copy one prompt into a new chat and fill in brackets. These are work categories, not standing teams. Start a fresh implementation/testing chat for each substantial outcome. Each prompt explicitly loads durable context because another chat's transcript is not inherited. See [the workflow](AI_COLLABORATION.md) for skill selection and verification.

## Product scope & roadmap

> Define the next ArenaVoca milestone for [audience/outcome]. Read AGENTS.md, docs/index.md and docs/project-state.md first, then the active PRD, personas and submission roadmap. Identify the user problem, priorities, options, exclusions and observable success criteria. Treat personas as hypotheses; separate accepted decisions from proposals. Ask only questions that materially affect scope. Produce a recommended bounded milestone and tradeoffs; record accepted changes in the PRD/roadmap and current next steps in project-state. Done when the intended experience, exclusions, unresolved decisions and evidence required for acceptance are explicit. Do not convert your recommendation into approval.

## Research & studies

> Investigate [one question] for [product decision]. Read AGENTS.md, docs/index.md and docs/project-state.md, then relevant research/evidence pages. Use the research skill when available and primary sources or relevant studies. Record source links, dates, methods, population/context, limitations, contradictions and uncertainty. Separate published findings, our measurements and hypotheses. Update the existing topic page, adding a study page only when needed. Done when the question has an evidence-backed answer or a clearly bounded unknown, implications for ArenaVoca and a recommended next test. Do not claim that general research proves this product works.

## Design

> Design [one journey/interaction] against accepted ArenaVoca requirements. Read AGENTS.md, docs/index.md and docs/project-state.md, then the active PRD, approved card/menu references and relevant Quest findings. Establish the user need, accessibility constraints and observable acceptance criteria. Propose a focused flow and visual/interaction changes with rationale. Use a prototype only to answer a named uncertainty; read required IWSDK skills before runtime work. Produce reviewable designs and a test plan, recording proposals separately from accepted decisions. Done when the interaction, alternatives for difficult gestures, failure states and device checks are clear. Implementation is limited to the prototype scope requested here.

## Implementation

> Deliver [one bounded feature/fix]. Read AGENTS.md, docs/index.md and docs/project-state.md, then the relevant PRD section and scoped app instructions. Inspect current code and working-tree changes; preserve unrelated work. Establish constraints, exclusions, acceptance criteria, checkpoints and verification before a complex change. Select the relevant phase's skill rather than every available workflow. Implement within existing feature boundaries, add meaningful behavior/regression coverage, run appropriate checks and review the complete diff. Update affected evidence and current handoff. Done when acceptance criteria are met or explicit blockers are recorded, with passed/failed/unverified checks and exact device/provider scope. Commit/push only within the task's authorization.

## External testing

> Independently evaluate [journey] at [revision/URL] in [agreed environment/device]. Read AGENTS.md, docs/index.md and docs/project-state.md, then accepted requirements and the relevant test checklist. Confirm environment and available access; inspect behavior without assuming implementation claims prove success. Record reproducible steps, expected versus observed behavior, severity, evidence and pass/fail/inconclusive for each case. Distinguish mocks, emulation, live integrations and human observations. Identify checks requiring user participation or missing access. Update the relevant evidence page and actionable handoff. Done when the agreed cases are accounted for and failures are reproducible; do not silently fix code or change production systems as part of testing.

## Optional categories

Use architecture & decisions for a contested boundary, independent code review for a fixed diff/baseline, security & privacy for a concrete data flow, or release & operations for a named release. Add a chat only when it serves that outcome. Creating or messaging chats requires the user's request; these templates do not create them.

For overlapping implementation, use separate worktrees. Commit shared guidance first, record the foundation revision in the handoff, and ensure each worktree contains it. Transfer conclusions through linked documents plus goal, completed work, next steps, files, blockers and verification—not a presumed shared transcript.
