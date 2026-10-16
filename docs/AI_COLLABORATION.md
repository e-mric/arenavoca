# Learning and building ArenaVoca with AI

Reviewed 16 October 2026 against [OpenAI’s Codex best practices](https://learn.chatgpt.com/guides/best-practices).

The guide recommends supplying a goal, relevant context, constraints and a completion condition; planning difficult changes; keeping durable instructions in AGENTS.md; and checking results through tests and review. It also recommends focused tools and skills, stable workflows before automation, and a separate chat for each coherent outcome. These are working habits, not a certification that a project is correct.

For ArenaVoca, The Way of Code is a creative reference. The practices below are our engineering application, not instructions attributed to Rick Rubin.

## What we already do, and what to strengthen

| Practice | Evidence in this project | Next habit |
| --- | --- | --- |
| Make the experience precise | The PRD and root AGENTS.md say learning panels must not control match playback | Before a feature, name the visible behavior and the failure case in one sentence |
| Preserve decisions | PRD, feature documentation and scoped IWSDK instructions survive a chat | Update the relevant document when a decision changes; avoid copying the entire history into each task |
| Deliver a bounded change | Local adapter and Match Lab integration were separate changes | Keep the full-game benchmark, Quest acceptance and slides as separate outcomes |
| Verify important behavior | The local integration has fixture tests, browser tests and explicit failure/stop cases | Review the diff, then try the behavior yourself; test counts alone do not establish quality |
| Distinguish evidence | Synthetic provider responses are labelled; Windows model performance and fresh-model Quest acceptance remain pending | Record actual model latency/quality separately from software checks and physical comfort |
| Learn the implementation | The demo script has questions about replay intent, video surfaces and shared Kotlin rules | Explain one changed behavior in your own words and predict a failure before testing it |
| Use tools deliberately | IWSDK skills and the local recognition adapter serve specific jobs | Add a tool or recurring task only when a repeated workflow warrants it |

The current session has unrestricted filesystem access and no approval prompts. That is broader access than the guide’s conservative starting recommendation; do not describe it as sandboxed. Permission changes remain the user’s decision. Secrets, local match media and generated frame sequences remain excluded from Git.

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
