# Learning and building ArenaVoca with AI

Reviewed 17 October 2026 against [OpenAI’s Codex best practices](https://learn.chatgpt.com/guides/best-practices).

The guide recommends supplying a goal, relevant context, constraints and a completion condition; planning difficult changes; keeping durable instructions in AGENTS.md; and checking results through tests and review. It also recommends focused tools and skills, stable workflows before automation, and a separate chat for each coherent outcome. These are working habits, not a certification that a project is correct.

For ArenaVoca, The Way of Code is a creative reference. The practices below are our engineering application, not instructions attributed to Rick Rubin.

## Working agreement

Start with [AGENTS.md](../AGENTS.md), [the index](index.md) and [current state](project-state.md). Requirements live in the PRD, architecture rationale in [the existing architecture page](wiki/architecture.md), verification commands below and evidence in the relevant report. These already cover engineering guidance; a parallel `engineering.md` would duplicate them.

For a complex outcome, write goal/context, constraints/exclusions, observable acceptance criteria, implementation checkpoints and verification before editing. For a small correction, keep this brief. End with a requirements-based diff review and an honest scope of evidence. [Starter prompts](chat-starters.md) provide five focused entry points.

## Skill routing

The [Matt Pocock repository](https://github.com/mattpocock/skills) provides methods, not project facts or additional authorization. On 17 October 2026, `codex plugin marketplace list` and `codex plugin list` confirmed marketplace `mattpocock` and `mattpocock-skills@mattpocock` **installed, enabled, 1.3.1** on this Mac. All nine methods below were present in the installed skill files and exposed in the session catalog. Installation does not automatically transfer to another machine or guarantee every cached skill is exposed in every session.

| Phase / intent | Method to consider |
| --- | --- |
| Investigate a specific question and retain evidence | `research` |
| Improve a boundary or small testable interface | `codebase-design` |
| Resolve domain terms and responsibilities | `domain-modeling` |
| Experiment on a bounded design uncertainty | `prototype` |
| Diagnose a failure using evidence | `diagnosing-bugs` |
| Implement test-first when appropriate/requested | `tdd` |
| Independent review against a named baseline | `code-review` |
| Write a pull-request description | `pr` |
| Maintain agent-facing guidance | `writing-for-agents` |

The session also exposes `grilling` and `wizard`; they are optional for their actual intents. Discover the current catalog when needed, then read the chosen SKILL.md. Cached methods not exposed by a session are not presumed callable.

Honor explicitly requested and otherwise required skills (including scoped IWSDK skills). For discretionary selection, use one primary workflow per phase; add supporting skills only for distinct capabilities. Check overlapping responsibilities, incompatible steps/outputs and unnecessary dependencies before combining them. Planning alone does not require a prototype, implementation does not require every design workflow, and external testing does not authorize production writes. Change methods as the phase changes, without loading all workflows together.

Instruction priority and authorized task scope resolve conflicts. If a material conflict remains, explain it and ask one focused question while continuing independent work. Engineering rules belong in AGENTS, methods in skills, facts/evidence/decisions in the wiki. Improve routing after repeated mis-selection; add custom skills only for a demonstrated repeated workflow. Check existing capabilities before adding plugins, preserve unrelated personal settings, and schedule only when requested.

For another machine, check the marketplace/plugin first. Install only missing components using the upstream commands:

```sh
codex plugin marketplace add mattpocock/skills
codex plugin add mattpocock-skills@mattpocock
```

Then verify the plugin's installed/enabled status and available skill files. This setup did not need installation or personal configuration changes. Source reviewed 17 October: [upstream installation](https://github.com/mattpocock/skills#installation-30-second-setup). Upstream's generic recommendation to grill every change is not adopted: the user's selective workflow and task scope take priority.

## Verification

Run from the repository root:

```sh
bash scripts/verify.sh docs
bash scripts/verify.sh app
```

The first runs four workflow-tooling tests, then checks local Markdown links/anchors and basic formatting in shared guidance; review factual accuracy, dates, contradictions and the final diff yourself. Optional file arguments check other changed Markdown pages: `bash scripts/verify.sh docs docs/QUEST_REVIEW.md`. It does not validate remote link availability, prose truth or device behavior.

The second uses the existing `app/package.json` checks: typecheck, unit tests, production build, then the full browser suite. Install dependencies with `cd app && npm ci` and the test browser with `npx playwright install chromium` first. For a bounded runtime change, the root instructions allow the affected browser specs after `npm run check`; explain omissions. Coverage is available separately through `npm run test:coverage`. Interactive IWSDK inspection follows app instructions; automated Playwright uses its existing test configuration.

Tests should cover observable business rules, application decisions, adapter contracts, integration wiring and affected journeys, rather than mirror internals. Keep external services/time controlled in deterministic tests and label fixtures. Tests live beside features; cross-feature journeys are in `app/tests/e2e/`. Add native/shared tests for native changes using [native verification](../README.md#native-kmp-companion-first-slice), and provider tests using [recognition setup](../app/src/features/match-recognition/README.md). These are not included in the web command.

[Web CI](../.github/workflows/app.yml) runs the same app command on app/tooling changes using public checked-in assets. [Documentation CI](../.github/workflows/docs.yml) checks shared guidance and changed Markdown files. Private-recording tests can skip; actual inference, Android/iOS UI and physical Quest checks remain separate. Hosted CI execution and repository branch protection are not established merely by adding these files. Documentation-only changes do not require unrelated app suites.

## Shared work and handoff

Every chat loads the same committed entry pages, follows relevant links and verifies claims against current source. Follow [wiki maintenance](wiki/AGENTS.md) for meaningful updates; reread shared pages immediately before editing and reconcile concurrent changes. Git tracks ordinary history. The project-state page carries the current goal/completed/remaining/files/blockers/verification, while topic documents retain evidence and rationale.

Use a fresh implementation or testing chat per substantial outcome. For overlapping code work, create separate worktrees from a revision containing the committed guidance; an older worktree needs that foundation integrated before relying on it. Check the branch/revision on each machine. Chats do not inherit transcripts or synchronize uncommitted files, and messaging another chat requires explicit user authorization.

## What we already do, and what to strengthen

| Practice | Evidence in this project | Next habit |
| --- | --- | --- |
| Make the experience precise | The PRD and root AGENTS.md say learning panels must not control match playback | Before a feature, name the visible behavior and the failure case in one sentence |
| Preserve decisions | PRD, feature documentation and scoped IWSDK instructions survive a chat | Update the relevant document when a decision changes; avoid copying the entire history into each task |
| Deliver a bounded change | Local adapter and Match Lab integration were separate changes | Keep the full-game benchmark, Quest acceptance and slides as separate outcomes |
| Verify important behavior | The local integration has fixture tests, browser tests and explicit failure/stop cases | Review the diff, then try the behavior yourself; test counts alone do not establish quality |
| Distinguish evidence | Fixture responses are labelled; bounded Windows trials are measured separately and physical Quest acceptance remains pending | Record actual model latency/quality separately from software checks and physical comfort |
| Learn the implementation | The demo script has questions about replay intent, video surfaces and shared Kotlin rules | Explain one changed behavior in your own words and predict a failure before testing it |
| Use tools deliberately | IWSDK skills and the local recognition adapter serve specific jobs | Add a tool or recurring task only when a repeated workflow warrants it |

The 17 October setup session had unrestricted filesystem access and no approval prompts. That is broader access than the guide’s conservative starting recommendation; do not describe it as sandboxed. Permission changes remain the user’s decision. Secrets, local match media and generated frame sequences remain excluded from Git.

## A reusable feature request

> Goal: connect local recognition to Match Lab.
>
> Context: read the current PRD and the match-recognition and match-lab features.
>
> Constraints: inference must never pause or seek the match; local failures must not switch to cloud; preserve the card I am holding.
>
> Done when: a validated draft can be selected, flipped and replayed; stop/failure cases are tested; the Windows instructions are accurate. Mark actual model and Quest checks as pending until performed.
>
> Learning: explain the provider boundary and one important tradeoff. Give me one small behavior to predict and test myself.

For a large or uncertain change, settle the approach and its acceptance evidence first. For a small correction, keep the explanation proportionate and implement it directly.

## Personal review before calling a feature understood

- Can I describe the input, the rule and the visible result without reading generated code aloud?
- Can I point to the changed feature and explain why that responsibility lives there?
- What happens when the model is unavailable, output is wrong, or the user stops?
- Which claims came from fixtures, an actual model, an emulator or my physical headset?
- What would I check next if a user reported a problem?

Use these as learning prompts, not a claim that Emeric has already mastered every part. Before presenting, rehearse only the first-person statements you can explain yourself.

## Five-minute presentation

Slide 6 uses four short cues: **Context → one behavior → verification → explanation**. The concrete example remains the Android replay that must stay paused after returning from the background. Its phone screenshot illustrates the separate iOS companion; it is not evidence of that Android bug.

The slide connects AI-assisted creation to accountable learning without adding time to the talk. [Speaker script](DEMO_STORY.md) and [deck notes](demo/README.md) carry the details.
