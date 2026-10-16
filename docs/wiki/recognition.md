# Recognition and evidence

Reviewed: 2026-10-16

## What Alba's sequence taught us

**Expected:** combining video and commentary would produce useful action descriptions and Spanish cards.

**Observed:** the cloud experiment on recording seconds 808–828 returned useful structure but included incorrect details about the finishing foot, a scoreboard change, and action timing. Frame review corrected the prepared content; the raw output remains separate.

**Learned:** plausible language is not sufficient evidence of a sporting event. Keep timestamps, input provenance, uncertainty, raw output, and human corrections traceable. Never use corrected cards as a measurement of unreviewed model accuracy.

**Evidence:** [PRD recognition handoff](../../PRD.md), [recognition experiment README](../../app/src/features/match-recognition/README.md), [prepared Alba content](../../app/src/features/match-lab/content/alba-generated.json). The reported 17.92 seconds is that experiment's model response time, not end-to-end latency or a live-performance benchmark. Private source media and raw run artifacts are not bundled with this wiki.

## Current implementation versus remaining proof

| Area | Evidence and limit |
| --- | --- |
| Cloud recognition | One documented Alba experiment and reviewed output; not a full-match quality result. |
| Local adapter | Ollama receives sampled timestamped frames; optional local Whisper supplies commentary text. Automated fixture tests verify contracts and failures. Actual local inference has not yet been measured. |
| Match Lab connection | Provider configuration and explicit Start flow are implemented. Browser fixtures exercise generated cards and stories; they are not model or Quest acceptance. |
| Full-recording evaluation | A dry-run window planner exists. A resumable inference benchmark and measured full-game cost/quality remain work to do. |
| Live sport and real-TV camera input | Future work. Recorded-video recognition is the current development path. |

The [feature README](../../app/src/features/match-recognition/README.md) owns commands, options, model configuration, and test details. A service on localhost can still call a cloud model: check the selected provider rather than interpreting “local service” as “local inference.” The current local path has no automatic cloud fallback.

## How this can lead to live viewing

Work on bounded recorded windows first, with realistic processing order and no future information. Then measure event correctness, timestamp alignment, useful Spanish content, latency, and resource usage. The same evidence contract can later accept live segments, but capture, delivery, synchronization, and operations still need implementation.

A possible future hybrid combines video evidence, commentary, and a licensed sports-event feed. Event data can help locate important moments; it does not replace the visual action, provide broadcast rights, or guarantee coverage of every pass. Camera input adds a separate capture and recognition problem. These are proposals described in the [PRD](../../PRD.md), not shipped features.

## Next experiment

On Windows, verify one visual-only Alba run, then one with commentary. Preserve both outputs and compare them with source evidence before accepting cards. Measure the whole pipeline separately from model response time. A GPU may reduce metered API spending, but compute, electricity, latency, and review effort still matter. The [cost estimate](../LIVE_COST_ESTIMATE.md) contains dated planning assumptions, not measured local savings.

Open questions: actual GPU memory headroom, action precision across a full match, replay/duplicate handling, useful-card rate, fluent Spanish review, and sustained latency. Start with [Windows continuation](windows-continuation.md).
