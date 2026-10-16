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

### Same-clip accuracy follow-up

The [follow-up trials](../WINDOWS_LOCAL_AI_2026-10-16.md#accuracy-follow-up--partial-improvement) did not solve the complete run → cutback → finish sequence. Clearer prompting, timestamp-labelled frames, denser sampling, larger context, short segments and local Qwen3.5 9B/27B comparisons were retained, including failures. The most conservative 27B result catches run/finish and withholds celebration as `other`, but still misses the cutback, takes 272 seconds and leaves very little GPU headroom. It is not an accepted live profile.

Local review policy v1 separately rejects explicit goal/aftermath contradictions. Revalidating the unchanged original raw results reduced visual goal candidates from three to one and commentary goal candidates from two to one. This is filtering, not better raw model accuracy or a calibrated semantic guarantee. Production preparation reproduces the measured 27B request fingerprint. Original raw outputs, separate policy-review files and provisional AI annotations stay private; no human correction or physical Quest approval is implied.

## How this can lead to live viewing

Work on bounded recorded windows first, with realistic processing order and no future information. Then measure event correctness, timestamp alignment, useful Spanish content, latency, and resource usage. The same evidence contract can later accept live segments, but capture, delivery, synchronization, and operations still need implementation.

A possible future hybrid combines video evidence, commentary, and a licensed sports-event feed. Event data can help locate important moments; it does not replace the visual action, provide broadcast rights, or guarantee coverage of every pass. Camera input adds a separate capture and recognition problem. These are proposals described in the [PRD](../../PRD.md), not shipped features.

## Next experiment

Continue with the recorded source; the camera investigation below is separate from the current Alba test.

The [Windows pilot](../WINDOWS_LOCAL_AI_2026-10-16.md) completed both Alba evidence modes. Total elapsed was 15.859 seconds visual-only and 13.656 with Whisper; the second run reused a warm model/image cache, so this is not a comparative speed result. Raw responses and a separate Codex AI audit are private; no human corrections or fluent Spanish approval were supplied. Both outputs miss the desired run/cutback structure and label celebration as goals. Next: human contact/timestamp review, then physical Quest acceptance and a deliberate sampling/context comparison. Do not start full-game inference from this result alone. A GPU may reduce metered API spending, but compute, electricity, latency, and review effort still matter. The [cost estimate](../LIVE_COST_ESTIMATE.md) contains dated planning assumptions, not measured local savings.

Open questions: whether about 1 GiB sampled GPU headroom is sufficient alongside immersive rendering, action precision across a full match, replay/duplicate handling, useful-card rate, fluent Spanish review, and sustained latency. Start with [Windows continuation](windows-continuation.md).

## Camera access is a separate capability gate

Reviewed 16 October 2026. In the [live-build Q&A at 24:40](https://www.youtube.com/watch?v=D04z9PYUSao&t=1480s), the answer describes camera access through `CameraSource` and `getUserMedia` broadly. The current [IWSDK camera documentation](https://iwsdk.dev/guides/13-camera-access.html) is more specific: `CameraSource` uses browser `MediaDevices` inputs and does not expose Quest passthrough imagery or raw tracking-camera frames. A camera must actually be exposed as a `videoinput`; a visible passthrough room is not evidence of that access. Follow the documented boundary rather than treating the live answer as a device capability guarantee.

There are three separate capabilities:

- **Passthrough presentation:** the user sees their room behind ArenaVoca. Visibility was user-confirmed on Quest; this does not supply pixels to our recognition service.
- **Hand interaction:** the platform supplies hand tracking. We do not need to obtain camera images and build our own hand-tracking model to manipulate cards.
- **Real-TV recognition:** the model needs an accessible image stream, permission, useful framing and timing, and a way to obtain commentary. Neither room visibility nor working hands establishes this pipeline.

The recorded ArenaVoca video is already an accessible analysis source, so this limitation does not block local Alba evaluation. For a future TV input, first inventory the cameras actually exposed on the target device/browser, verify permission and capture behavior, and record the result. If no suitable feed is available, document that blocker and investigate a separately supported capture path before promising the feature. Availability on future glasses remains unverified.

The [roadmap camera gate](../SUBMISSION_ROADMAP.md#future-real-tv-camera-investigation) keeps this investigation after the protected submission work. Capture capability, action recognition quality, and Spanish quality must each earn their own evidence.
