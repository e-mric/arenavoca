# Wiki log

Append entries at the end. This log records knowledge changes, not a replacement for Git history or raw experiment reports.

## [2026-10-16] ingest | Bootstrap from project documents and LLM Wiki idea

- Adapted the user-supplied `llm-wiki.md` pattern into a small linked Markdown wiki with scoped maintenance instructions. Existing authoritative documents remain in their original locations.
- Synthesized architecture decisions, immersive-viewing lessons, recognition evidence, language-learning and demo framing, and Windows continuation.
- Sources: [PRD](../../PRD.md), [README](../../README.md), [recognition guide](../../app/src/features/match-recognition/README.md), [Quest review](../QUEST_REVIEW.md), [research](../SPANISH_THROUGH_SPORT_RESEARCH.md), [collaboration guide](../AI_COLLABORATION.md), [demo story](../DEMO_STORY.md), and [submission roadmap](../SUBMISSION_ROADMAP.md). Latest documentation baseline: [3a30832](https://github.com/e-mric/arenavoca/commit/3a30832).
- Preserved key uncertainty: actual local-model performance and full-game cost/quality are unmeasured; physical passthrough visibility is narrower evidence than full Quest acceptance; Spanish awaits fluent review.
- Reconciled differing pack counts by identifying the mobile prepared pack and Match Lab pack separately. Older README statements that automatic detection is future work describe the earlier manual experience; the current PRD and recognition guide describe the newer opt-in experiment. Neither establishes production live recognition.
- Historical Quest placement guidance predates later direct-manipulation work. Consult the current PRD for intended behavior, and record fresh device observations before accepting it.
- The wiki contains summaries of recorded project learning, not a claim that the user has personally mastered each concept. Private media, secrets, and raw experiment artifacts were not ingested into Git.

## [2026-10-16] lint | Initial wiki verification

- Checked all eight wiki pages: 65 local links resolved, linked anchors resolved, every page was indexed, and no machine-specific absolute paths were present.
- Typecheck, all 214 app unit tests, and production build passed. Existing font-atlas, dependency annotation, and bundle-size warnings remain. No product behavior changed; no browser journey was affected or rerun for this documentation update.
- Reviewed the wiki against the current handoff and feature documentation. External pricing, eligibility, and deadlines were not independently revalidated in this pass; their dated source documents remain authoritative pending the next submission review.

## [2026-10-16] ingest | Windows local Alba pilot and actual Match Lab delivery

- **Expected:** the documented generic Qwen3-VL 8B configuration would produce a bounded Alba draft, then commentary would improve its actions and timing.
- **Happened:** verified the transferred recording and RTX 5080/16 GB; installed native local dependencies. Generic 8B failed context at 1 fps and output length at 0.5 fps. Explicit 8B instruct at 0.5 fps completed both modes, with raw outputs preserved privately. Commentary retained role/action mistakes and introduced a misheard name. Neither draft is approved content.
- **Learned (AI-written synthesis):** package tags and image-token budgets must be measured, warm-cache latency is not a fair mode comparison, and schema validity does not establish event truth. The 3D card renderer also reset desktop reveal state outside immersive mode; restricting orientation synchronization to active immersive sessions fixed the actual browser probe.
- **Evidence:** [dated pilot report](../WINDOWS_LOCAL_AI_2026-10-16.md), [feature setup](../../app/src/features/match-recognition/README.md), [recognition synthesis](recognition.md). Typecheck, 60 Python tests, 215 Vitest tests, build and eight affected browser tests passed. A separate actual-model browser probe analyzed exactly 808–828, with pinned face, flip, story, muted replay and uninterrupted main playback verified. Analysis was stopped after one window.
- **Next check:** human review of contacts/transcript, fluent Spanish review and physical Quest theater/passthrough acceptance. Full-game inference, sustained latency and energy remain unmeasured. Recordings, weights, frames, transcripts and raw responses remain outside Git; separate AI annotations do not stand in for human corrections.
