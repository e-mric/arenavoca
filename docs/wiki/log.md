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

## [2026-10-16] ingest | Local accuracy follow-up remains incomplete

- **Expected:** better temporal evidence and action definitions would recover Alba's run, cutback and finish without repeating celebration goals.
- **Happened:** tested prompt changes, image layouts, time labels/overlay masking, denser/higher-resolution evidence, larger context, short windows and explicitly installed local Qwen3.5 9B/27B models. Retained failed outputs and unchanged baselines. Conservative 27B output catches run/finish and withholds celebration, but still misses the cutback; 272-second total makes it unsuitable for the current live step.
- **Learned (AI-written synthesis):** more frames/context or a larger model does not establish better recognition. Narrow transfer prompts even created false transfers and were rejected. A separate review-policy veto reduces obvious celebration/scoreboard goal candidates without changing raw results; this must not be scored as raw-model accuracy.
- **Evidence:** [complete dated trials, timings and artifact locations](../WINDOWS_LOCAL_AI_2026-10-16.md#accuracy-follow-up--partial-improvement), [updated local controls](../../app/src/features/match-recognition/README.md). Exact production request fingerprint reproduced for the measured 27B profile; baseline raw hashes remained unchanged. Typecheck, 66 Python tests, 215 app tests, build and eight affected browser tests passed. No new physical Quest or fluent Spanish acceptance.
- **Next check:** independent contact-time/identity review and a detector/tracker or temporally trained model investigation. Do not promote a complete three-action recognition claim or start a full-game run from these partial results.
## [2026-10-16] ingest | IWSDK live-build lessons and Quest/camera gates

- Reviewed the Devpost [IWSDK live build](https://www.youtube.com/watch?v=D04z9PYUSao) using its chapter metadata and selected automatic-transcript passages, with the official [release announcement](https://developers.meta.com/vr/blog/immersive-web-sdk-1-0/), [testing guide](https://iwsdk.dev/guides/02-testing-experience.html), and [camera guide](https://iwsdk.dev/guides/13-camera-access.html) checked on 16 October.
- Added runtime inspection, repeatable hand interactions, independent review, and connected-Quest testing lessons to [immersive viewing](immersive-lessons.md); linked them from the index and Windows continuation.
- Recorded a source discrepancy in [recognition](recognition.md): the live camera answer is broader than the documented `MediaDevices` boundary. Passthrough display, platform hand tracking, and analyzable camera input are separate capabilities.
- Added pending [roadmap gates](../SUBMISSION_ROADMAP.md) for one-card testing in theater/passthrough and later real-TV capture feasibility. Preserved recorded-first scope, independent main playback, physical usability checks, and separate Spanish review. No device acceptance, model result, or camera capability was established by this documentation update.

## [2026-10-16] lint | IWSDK learning update verification

- Checked nine documents and 81 local links/anchors; all resolved and wiki pages remained indexed. Git whitespace validation passed.
- Typecheck, 214 app unit tests, and production build passed. Existing font-atlas, dependency annotation, and bundle-size warnings remain. Documentation only: no affected browser tests or new physical-device tests were run.

## [2026-10-16] lint | Reconcile concurrent Windows results

- Integrated remote commits `cf5b857` and `839b6e0`, preserving the actual Windows pilot, accuracy follow-up, and raw-output limitations. Resolved overlapping wiki edits and replaced the roadmap's stale no-local-run statement with the measured report.
- Rechecked 93 local links/anchors after integration. Typecheck, 215 app tests, 66 Python tests, production build, and eight affected browser tests passed. Existing build warnings remain.
- The first browser run hit an unrelated application on port 4173 and was stopped. Reran against ArenaVoca on isolated port 4273 using a temporary configuration, then removed it. The other application was left running. These results do not establish physical Quest or camera acceptance.

## [2026-10-16] ingest | Tabletop sports actions and Drawcall investigation

- Recorded the user's requested miniature football/F1 interaction in the [PRD](../../PRD.md#tabletop-match-lab-direction--16-october-2026), with proposed Spanish prompts, action rules, accessible input alternatives, and staged [roadmap work](../SUBMISSION_ROADMAP.md#tabletop-match-lab-delivery). Interpreted F1 “stand” as pit entry, explicitly marked as an assumption.
- Inspected the current cutback board/rules to distinguish existing selectable-marker behavior from the requested character-based playground. No tabletop runtime changes were made.
- Added [Drawcall findings](tabletop-match-lab.md) from its official site, Codex guide and GLTS repository. Candidate use is original asset authoring and visual refinement; runtime integration, export, dependency compatibility and device performance remain untested. No tool was installed or connected, and no asset or private recording was uploaded.
- Verification: 105 local wiki/roadmap links and anchors resolved; whitespace check, typecheck, 215 app unit tests and build passed. Existing build warnings remain. No product behavior changed or additional browser/device acceptance was claimed.

## [2026-10-16] ingest | Drawcall tabletop implementation

- Added original GLTS player/pitch source and static GLB exports, integrated with the existing IWSDK asset manifest. Drawcall sign-in worked; generation failed with missing entitlement, so these are authored procedural assets rather than AI-generated meshes. Source notes record provenance and reproduction commands.
- Implemented the pass/shot slice with optional translation, correction/retry, separate near-grab and distance-selection paths, movable/resizable pitch and instruction window, and an accessible browser alternative. Preserved prepared cards, old cutback activity, main playback authority and the original sample route.
- Verification: typecheck, 222 unit tests, production build, nine affected browser tests on isolated port 4273, and scene schema/render validation passed. Emulator input proved ball grab/move/release, ring/teammate/goal selection and the spatial Next control. Material/clay and active-XR previews were inspected. Final player export removes zero-area pole triangles (2,480 triangles); the editor's cached initial preview reported pole degeneracies before that cleanup.
- Physical Quest hands, resizing comfort, passthrough alignment and performance remain pending, along with fluent Spanish review. Existing build font-atlas and bundle/dependency warnings remain. Updated the PRD, roadmap, asset provenance and Quest checklist; local file links and Git whitespace checks passed. The temporary browser-test configuration was removed; unrelated port 4173 was left untouched.


## [2026-10-16] ingest | Minimal tabletop and team identity

Updated the tabletop topic and authoritative requirements/checklists for grabbable toy teammates, one physical bilingual card, assisted pull-and-release gestures, mobile Playmaker colors and selected football kits. Recorded automated/controller-emulator evidence and the card-edge interaction finding separately from pending physical Quest acceptance. F1 stays after the first football review.

## [2026-10-16] ingest | Optional team atmosphere

Updated [Tabletop Match Lab](tabletop-match-lab.md) with the user-approved stadium window, team banner, short success celebration and retained Minimal option. Linked original source, test evidence and pending Quest acceptance. No room scanning or learning-outcome improvement is claimed.

## [2026-10-16] ingest | VR design reset and hands-on-table reveal

Recorded the user's rejection of the accumulated VR design and selection of the minimal large-screen/tabletop reference. Updated the PRD, design flow, roadmap and [tabletop topic](tabletop-match-lab.md) to retire cinema/stadium/banner decoration from the active direction. Hands resting on the table should reveal practice; lifting hands must leave it stable. Two-finger football remains an optional physical-device experiment. The video effect is user-reported; surface and hand APIs are capability references only. Implementation remains paused; no application behavior or acceptance status changed.


## [2026-10-16] ingest | Implemented minimal XR reveal

Implementation resumed after the user's explicit request. Updated the PRD, design status, roadmap and [tabletop topic](tabletop-match-lab.md) for the new large-screen route, stable two-hand reveal and manual/calibration fallbacks. Recorded automated and managed-emulator evidence separately from pending Quest surface/hand/comfort checks. The earlier pause entry describes the previous design-only turn; finger kicking remains proposed.

## [2026-10-16] ingest | Remove retired XR editor content

Expected the minimal runtime to leave a clean authoring scene; the user’s editor screenshots showed the hidden legacy dashboards and stadium still present. Removed their scene entries and manifest registrations, unified XR entry on the minimal adapter, and restored displaced dock/card content to its parent. Lesson: hiding an object during playback does not remove it from the editor. Scene contract tests and managed-emulator checks cover the cleanup; physical acceptance remains pending in [Quest review](../QUEST_REVIEW.md#retired-panel-removal-acceptance--16-october-2026). The original sample media and browser learning journey remain available.

## [2026-10-16] ingest | Timed cards and lighter control proposal

The user deferred tabletop play and requested cards at the matching recording moments, plus historical pregame news and lineup stories. Timed delivery is being verified; a gesture wrist menu and illustrated Replay/Listen/Save card are design proposals, not implemented interactions. Saving moments for mobile revisiting is a requirement; automatic cross-device sync remains pending. See the [design proposal](../design/wrist-menu-2026-10-16/README.md) and current [PRD](../../PRD.md#active-xr-design-reset--16-october-2026).


## [2026-10-16] ingest | Virtual cards approved; physical surfaces deferred

User approved on-card Replay/Listen/Save, physical translation flipping and the lighter gesture menu. Retained phone/printed-marker approaches as optional roadmap experiments, with camera/pose verification and tracking-loss gates. Local save and successful mobile sync remain separate. Product behavior and device acceptance are owned by the PRD and Quest review; see [current direction](tabletop-match-lab.md#approved-card-controls--16-october-2026).

## [2026-10-17] ingest | Card silhouette and quiet arrivals

Compared the supplied concept with the runtime: replaced tile buttons with circles, rounded the card faces and illustration geometry, and added an optional animated New moment invitation. Playback remains independent. See [comparison](../design/wrist-menu-2026-10-16/comparison.md) and [Quest checks](../QUEST_REVIEW.md); no physical-device acceptance claimed.

## [2026-10-17] ingest | Shared development workflow and current handoff

- Added the [context index](../index.md), [current-state handoff](../project-state.md) and [five chat starters](../chat-starters.md), reusing existing architecture, research, design and testing pages. Root instructions route each task through the same entry points; current status no longer requires reconstructing historical PRD sections.
- Verified Matt Pocock's marketplace/plugin is already installed and enabled at 1.3.1. [Skill routing and verification](../AI_COLLABORATION.md) record selective phase-based use, machine-local installation limits and evidence scope. No personal configuration changes or new chats/automations were needed.
- Corrected active overview references to retired YouTube/burgundy UI; preserved historical experiment evidence. Prepared-card scope, pending Quest acceptance, Spanish review and public-content rights remain explicit.
- Added reusable docs/web verification entry points and CI definitions. Documentation/link checks and tooling checks are separate from historical app results; hosted CI, current physical headset behavior and native checks are not newly verified by this setup.

## [2026-10-18] ingest | Football-summary source review

- Retained a [commit-pinned source review](../FOOTBALL_SUMMARY_REPO_REVIEW_2026-10-18.md) of the user-supplied repository. Actual detection/tracking and transcription are separate from weak event heuristics, an inferred frame/time conversion defect and unverified quality/performance claims.
- Proposed a bounded detector-assisted recognition comparison; no product change or adoption is approved by this research. Checkpoint provenance and reuse terms remain unresolved. No external code, models or media were executed or downloaded.
- Verification: documentation checks passed for nine changed/new Markdown files and 117 local links/anchors, including four workflow-tooling tests. Diff whitespace and source review passed. Application, provider and device suites were not run for this research-only change.

## [2026-10-18] ingest | Maintained detection and tracking candidates

- Added a [dated comparison](../MAINTAINED_FOOTBALL_TRACKING_2026-10-18.md) with recent releases, pinned source evidence and component/checkpoint licensing distinctions. Retained RF-DETR + Roboflow Trackers + Supervision as the proposed bounded comparison; Ultralytics is an alternative, not an adoption decision.
- Recorded Supervision's actual removal of `sv.ByteTrack`, the older state of the football demo, the need for a source-timed evidence adapter and unmeasured Windows/GPU/accuracy limits. No dependencies, models or media were installed/downloaded, and no product behavior changed.
- Expanded documentation verification passed: 13 files and 175 local links/anchors, including both research notes, recognition/log pages and shared guidance; four workflow-tooling tests passed. The preceding entry's nine-file result covered the default shared-guidance set, not all changed/new Markdown files. Diff/source review passed; no application, model or physical-device test was run.

## [2026-10-18] ingest | Actual Alba detection/tracking comparison

- Installed isolated RF-DETR Small, ByteTrack and Supervision, and added offline source-PTS tracking plus a paired local evidence adapter. The [actual Mac trial](../ALBA_TRACKING_TRIAL_2026-10-18.md) preserves native detections, gaps, frame/video previews, request fingerprints and raw outputs privately.
- Neither Qwen/Whisper arm recovered the cutback; the assisted arm lost the run and produced late/duplicate finish descriptions. The goal review guard withheld duplicates, but one mistimed shot remained. Tracking continuity and schema validity did not establish action accuracy; no prepared card or runtime integration was changed.
- Closer source inspection revised the provisional AI backward-pass range from 813.4–814.6 to roughly 814.7–815.5. This is an AI observation with sampling uncertainty, not human contact/goal-line ground truth. Historical evidence remains unchanged.
- Verification: 71 recognition Python tests, typecheck, 297 app unit tests and production build passed. Actual model checks ran on macOS/MPS; browser, Windows/CUDA and physical Quest checks were not run. Existing build warnings remain.

## [2026-10-18] ingest | Cropped/tiled Alba ball detection and RTX handoff

- Implemented fixed central cropping and overlapping tiles with source-coordinate restoration and duplicate merging. The [follow-up](../ALBA_TRACKING_TRIAL_2026-10-18.md#cropped-and-tiled-follow-up) matches all six AI-inspected ball points, versus four in the original full view; more off-point candidates remain. This is a development spot audit, not human ground truth or general accuracy.
- A source/image/request/model-verified Qwen retry with cropped evidence timed out after 300 seconds without raw output. Preserved the failure and stopped that experiment's model. Better ball detection is distinct from unproven cutback action improvement.
- Prepared a [Windows/CUDA guide](../WINDOWS_TRACKING_RUN_2026-10-18.md) and source-only transfer package for the user's proposed RTX repeat. Actual CUDA execution, speed and model output remain pending; no runtime card/provider behavior changed.
- Verification: 76 recognition Python tests, typecheck, 297 app tests and production build passed. New fixtures cover coordinate restoration, overlap/vendor metadata, missing audit evidence, saved-control identity and refusal to fall back from unavailable CUDA. Existing build warnings remain; browser/native/headset checks were not run.
