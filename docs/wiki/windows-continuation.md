# Continuing on Windows

Reviewed: 2026-10-16

The next target is the user's Windows desktop with an RTX 5080 and 64 GB system RAM. GPU memory capacity and local inference performance still need verification. No remote connection was established in the recorded handoff.

## First session

1. Pull the repository and read the [PRD current-state handoff](../../PRD.md#project-handoff-and-current-state), then [recognition lessons](recognition.md).
2. Follow the **Windows: first visual smoke test** section in the [recognition README](../../app/src/features/match-recognition/README.md). It owns installation and run commands. Create the Windows environment there; a Mac virtual environment is not portable.
3. Transfer the private recording separately to the location specified in that guide. Check its recorded duration/hash before comparing timestamps. Git does not contain the full match, model weights, credentials, or raw frame sequences.
4. Run one Alba window locally and inspect its output before starting more analysis. Then add local commentary and compare evidence, errors, latency, and resource use.
5. Connect the chosen provider to Match Lab using the same feature guide. Verify the provider label before explicit Start, then check cards, translations, story selection, and uninterrupted main playback.
6. Record the result in the [wiki log](log.md) and update the relevant topic with its evidence. Use the [Quest checklist](../QUEST_REVIEW.md) for physical testing; keep browser results separate.

The baseline implementation is recorded by commits [4f67dcc](https://github.com/e-mric/arenavoca/commit/4f67dcc) (local adapter), [303482b](https://github.com/e-mric/arenavoca/commit/303482b) (dry-run planning), and [5730fd9](https://github.com/e-mric/arenavoca/commit/5730fd9) (Match Lab provider connection). These are milestones, not instructions to reset the checkout.

## What Git carries, and what it does not

Tracked source, wiki, PRD, roadmap, and demo narrative travel with the repository. The current generated presentation and private broadcast-derived assets may require separate transfer; see [deck notes](../demo/README.md). iOS work still needs the Mac toolchain. Android UI inspection uses an emulator; do not install the instrumentation server on the physical phone.

Keep the first desktop task focused on proving one local run. Full-game benchmarking, live broadcasting, and camera recognition are later steps. Their readiness should follow measured results, not merely successful installation.
