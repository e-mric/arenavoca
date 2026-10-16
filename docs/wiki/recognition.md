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
| Local adapter | Windows pilot measured Qwen3-VL 8B instruct with ten sampled frames, with and without CPU/int8 Whisper. Raw drafts contain factual/action/timing errors; see the [dated report](../WINDOWS_LOCAL_AI_2026-10-16.md). |
| Match Lab connection | Actual local gateway-to-desktop draft/flip/story/muted-replay delivery passed for 808–828, preserving playback and pinned face after a focused fix. Fixture checks also pass. Physical Quest acceptance remains pending. |
| Full-recording evaluation | A dry-run window planner exists. A resumable inference benchmark and measured full-game cost/quality remain work to do. |
| Live sport and real-TV camera input | Future work. Recorded-video recognition is the current development path. |

The [feature README](../../app/src/features/match-recognition/README.md) owns commands, options, model configuration, and test details. A service on localhost can still call a cloud model: check the selected provider rather than interpreting “local service” as “local inference.” The current local path has no automatic cloud fallback.

## How this can lead to live viewing

Work on bounded recorded windows first, with realistic processing order and no future information. Then measure event correctness, timestamp alignment, useful Spanish content, latency, and resource usage. The same evidence contract can later accept live segments, but capture, delivery, synchronization, and operations still need implementation.

A possible future hybrid combines video evidence, commentary, and a licensed sports-event feed. Event data can help locate important moments; it does not replace the visual action, provide broadcast rights, or guarantee coverage of every pass. Camera input adds a separate capture and recognition problem. These are proposals described in the [PRD](../../PRD.md), not shipped features.

## Next experiment

The [Windows pilot](../WINDOWS_LOCAL_AI_2026-10-16.md) completed both Alba evidence modes. Total elapsed was 15.859 seconds visual-only and 13.656 with Whisper; the second run reused a warm model/image cache, so this is not a comparative speed result. Raw responses and a separate Codex AI audit are private; no human corrections or fluent Spanish approval were supplied. Both outputs miss the desired run/cutback structure and label celebration as goals. Next: human contact/timestamp review, then physical Quest acceptance and a deliberate sampling/context comparison. Do not start full-game inference from this result alone. A GPU may reduce metered API spending, but compute, electricity, latency, and review effort still matter. The [cost estimate](../LIVE_COST_ESTIMATE.md) contains dated planning assumptions, not measured local savings.

Open questions: whether about 1 GiB sampled GPU headroom is sufficient alongside immersive rendering, action precision across a full match, replay/duplicate handling, useful-card rate, fluent Spanish review, and sustained latency. Start with [Windows continuation](windows-continuation.md).
