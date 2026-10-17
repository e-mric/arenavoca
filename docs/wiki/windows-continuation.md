# Continuing on Windows

Reviewed: 2026-10-18

The target is the user's Windows desktop with an RTX 5080 and 64 GB system RAM. The original Mac handoff had not verified GPU capacity or local performance and established no remote connection; the desktop pilot below supplies the first measurements.

**Desktop pilot completed 16 October:** verified 16,303 MiB GPU capacity, recording hash/duration, installed local dependencies, and ran visual-only then local Whisper comparisons on 808–828. Use explicit `qwen3-vl:8b-instruct` at 0.5 fps for this tested configuration; the generic tag failed context/output bounds. Actual local-model-to-desktop Match Lab delivery passed after fixing a non-immersive pinned-face reset. Content quality is insufficient for approval, GPU headroom is narrow, and physical Quest acceptance remains pending. See [measured results and remaining questions](../WINDOWS_LOCAL_AI_2026-10-16.md).

**Accuracy follow-up:** the local 27B labelled-frame profile improved conservative run/finish output and excluded celebration goals, but did not recover the cutback and took 272 seconds with CPU offload. It is an offline comparison, not a live upgrade. A separate raw-preserving review guard rejects obvious celebration/scoreboard-only goal candidates. Keep the prepared pack for demonstrations; see the [full trial record](../WINDOWS_LOCAL_AI_2026-10-16.md#accuracy-follow-up--partial-improvement) before selecting larger models or dense sampling.

## Setup or reproduction session

For the **18 October detector experiment**, use the [RTX reproduction guide](../WINDOWS_TRACKING_RUN_2026-10-18.md). Mac full/crop/tile runs recovered more inspected ball points with closer views, but the cropped-evidence Qwen retry timed out; this is not a demonstrated cutback-recognition improvement. The guide keeps source/weights/thresholds aligned and checks an actual CUDA operation. Source-only transfer excludes the recording and weights; actual Windows execution remains pending. Continue the viewer/provider steps below only for their separately scoped acceptance work.

1. Pull the repository and read the [PRD current-state handoff](../../PRD.md#project-handoff-and-current-state), then [recognition lessons](recognition.md).
2. Follow the **Windows: first visual smoke test** section in the [recognition README](../../app/src/features/match-recognition/README.md). It owns installation and run commands. Create the Windows environment there; a Mac virtual environment is not portable.
3. Transfer the private recording separately to the location specified in that guide. Check its recorded duration/hash before comparing timestamps. Git does not contain the full match, model weights, credentials, or raw frame sequences.
4. Run one Alba window locally and inspect its output before starting more analysis. Then add local commentary and compare evidence, errors, latency, and resource use.
5. Connect the chosen provider to Match Lab using the same feature guide. Verify the provider label before explicit Start, then check cards, translations, story selection, and uninterrupted main playback.
6. Follow the [Quest interaction testing gate](../SUBMISSION_ROADMAP.md#quest-interaction-testing-gate) for the first generated card. Investigate the SDK's connected-headset tooling, then use the [Quest checklist](../QUEST_REVIEW.md) for physical testing; keep browser, automated-device, and human-use results separate.
7. Record the result in the [wiki log](log.md) and update the relevant topic with its evidence. Read the [camera limitations](recognition.md#camera-access-is-a-separate-capability-gate) before planning real-TV recognition; the current recorded-video test does not depend on camera access.

The baseline implementation is recorded by commits [4f67dcc](https://github.com/e-mric/arenavoca/commit/4f67dcc) (local adapter), [303482b](https://github.com/e-mric/arenavoca/commit/303482b) (dry-run planning), and [5730fd9](https://github.com/e-mric/arenavoca/commit/5730fd9) (Match Lab provider connection). These are milestones, not instructions to reset the checkout.

## What Git carries, and what it does not

Tracked source, wiki, PRD, roadmap, and demo narrative travel with the repository. The current generated presentation and private broadcast-derived assets may require separate transfer; see [deck notes](../demo/README.md). iOS work still needs the Mac toolchain. Android UI inspection uses an emulator; do not install the instrumentation server on the physical phone.

The initial local run and desktop delivery are now documented above. Continue with human evidence review and the pending physical Quest interaction gate; reproduce setup only when needed. Full-game benchmarking, live broadcasting, and camera recognition are later steps. Their readiness should follow measured results, not merely successful installation.
