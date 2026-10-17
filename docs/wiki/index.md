# ArenaVoca project wiki

Reviewed: 2026-10-17

Start each task at the [context index](../index.md) and [current state](../project-state.md). Use this topic index to understand why the project works this way and what remains unproven. These pages synthesize existing documents and development history; they do not replace the [PRD](../../PRD.md). This is a small Git-backed Markdown wiki: no service, plugin, or model is required to read it.

## Read by task

| Page | What it answers |
| --- | --- |
| [Architecture and boundaries](architecture.md) | Why IWSDK and KMP? Where does each responsibility belong? |
| [Lessons from immersive viewing](immersive-lessons.md) | What makes VR useful? What can we learn from the IWSDK live build and Quest testing? |
| [Tabletop Match Lab](tabletop-match-lab.md) | Deferred experiment: miniature actions and Drawcall investigation; not active onboarding |
| [Recognition and evidence](recognition.md) | What did Alba teach us? What is ready for local AI, and why is camera access a separate gate? |
| [Learning and the demo](learning-and-demo.md) | How do match moments become Spanish practice, and how do we explain our learning? |
| [Windows continuation](windows-continuation.md) | What should the next desktop session read, transfer, and verify? |
| [Wiki log](log.md) | What knowledge was added or corrected, and when? |
| [Maintenance conventions](AGENTS.md) | How should future chats ingest, query, and check this wiki? |

## Authoritative sources

| Need | Read |
| --- | --- |
| Product requirements / current handoff | [PRD](../../PRD.md) / [project state](../project-state.md) |
| Project run/build instructions | [Repository README](../../README.md), [application README](../../app/README.md) |
| Recognition setup, Windows commands, experiment details | [Recognition README](../../app/src/features/match-recognition/README.md) |
| Implementation history and automated verification | [Implementation record](../IMPLEMENTATION.md) |
| Measured local-model results and failed trials | [Windows Alba pilot and follow-up](../WINDOWS_LOCAL_AI_2026-10-16.md) |
| Physical headset acceptance | [Quest review](../QUEST_REVIEW.md) |
| Language-learning research and its limits | [Spanish through sport research](../SPANISH_THROUGH_SPORT_RESEARCH.md) |
| Users and needs | [Personas](../PERSONAS.md) |
| AI collaboration and personal learning | [Collaboration guide](../AI_COLLABORATION.md) |
| Five-minute English presentation | [Demo story](../DEMO_STORY.md), [deck notes](../demo/README.md) |
| Submission deadlines, eligibility, deliverables | [Submission roadmap](../SUBMISSION_ROADMAP.md) |
| Live-service cost assumptions | [Dated cost estimate](../LIVE_COST_ESTIMATE.md) |
| Asset provenance and review status | [Asset provenance](../../app/content-source/asset-provenance.md) |

Prefer dated current-state sections over older prototype descriptions. If code, requirements, and evidence disagree, record the discrepancy and check it before changing behavior. External deadlines, prices, and platform capabilities require fresh verification when making a new decision.

## How to use it across chats

Ask a focused question such as “Read the recognition page and help me verify one local Alba run,” or “Add today's Quest observations, separating what worked from what remains untested.” Useful findings can become small page updates with source links and a log entry. The wiki is maintained through those edits; it does not update automatically.

The structure adapts the user-supplied **LLM Wiki** idea file (`llm-wiki.md`, supplied 16 October 2026): sources → linked synthesis → maintenance conventions, with ingest/query/lint operations. The original attachment remains external; this wiki records the adopted pattern without depending on its Mac Downloads location. Existing project documents stay in place, and private experimental evidence stays private. AI summaries still need review.
