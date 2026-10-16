# Windows local AI pilot — Alba 808–828

Reviewed: 2026-10-16. Scope: one private recording window, two evidence modes and a desktop Match Lab integration check. No full-game inference or cloud upload.

## Machine and setup

- RTX 5080, NVIDIA driver 610.88; `nvidia-smi` reports 16,303 MiB capacity and initially 3,462 MiB in use. Windows reports 66,211,758,080 bytes physical RAM (about 61.7 GiB).
- Node 24.14.0, npm 11.18.0; Python 3.11.9 in the ignored project environment. Python 3.14 was also installed but was not selected. Store Python needed execution outside the tool sandbox.
- Installed Ollama 0.40.5, FFmpeg/ffprobe 9.0.2, faster-whisper 1.2.1 and CTranslate2 4.8.3. Downloaded Whisper small and Qwen weights deliberately during setup; inference used local files. Whisper uses CPU/int8, detected English, with `HF_HUB_OFFLINE=1` and the adapter's `local_files_only=True`.
- Enabled the persistent user `OLLAMA_NO_CLOUD=1` setting. Restarted the installer-started Ollama process explicitly with `OLLAMA_NO_CLOUD=1` and `OLLAMA_HOST=127.0.0.1:11434`. Private server startup log confirms **cloud disabled: true** and a loopback listener. The initial separate launch encountered an occupied port; it did not replace the installer process until the explicit restart.
- The supplied recording was in `app/public/media/`; moved it to the documented ignored `app/public/media/user/barca-2018-h264.mp4`. SHA-256 matches `16450bd54c298888f4506383ac98e5b09fc4dd96a736b733ca47e0401b37b638`; duration is exactly 5960.794558 seconds by ffprobe. Regenerated private silent prepared replays using the video-only portion of `prepare-media.py`; macOS `say` was not run and existing tracked speech was not replaced.

## Failures and selected configuration

The generic `qwen3-vl:8b` installed with digest `901cae73216286ea8c5aba8b46d307ff7188f737285ec500c795a12f05225d28` and a `qwen3-vl-thinking` renderer/parser. At 1 fps, 20 images required 22,065 input tokens, exceeding the adapter's 16,384-token context. The HTTP request failed after about 21.6 seconds; the existing adapter returned its generic unavailable/rejected error. No raw model response exists for that failed HTTP request; the private server log preserves the context-overflow reason.

An explicit 0.5 fps retry fit (11,240 input tokens), but exhausted the 2,048 output-token cap in thinking mode (`done_reason: length`, no completed JSON). Its raw response remains preserved and rejected. There was no automatic retry, acceptance of truncated content, context increase or cloud fallback.

Selected explicit **`qwen3-vl:8b-instruct`**, Q4_K_M, digest `0533d74300e4f9bc367d675d4e64ffd073d50ff16a2b4096cc2e8a1cf8c96319`. Added only that tag to the existing local allowlist; original defaults remain compatible. [Official package](https://ollama.com/library/qwen3-vl:8b-instruct). Both completed comparisons use the same 20-second excerpt bytes (`2100577c528eaca2357391c966e500920a0ead285a0717fcb9c77542faf38f44`), ten 640px images at 0, 2, …, 18 seconds, context 16,384, output cap 2,048, seed 42 and temperature 0. Sparse images can miss the decisive touch; this is not a recommended full-game configuration or an accuracy result.

## Timing and GPU samples

Seconds, measured using a monotonic clock. Excerpt preparation includes probing, encoding and whole-source hashing. Adapter preparation includes preflight and frame extraction. Total includes these stages, request construction, validation and metadata writes, but excludes dependency/model downloads and subsequent manual review. GPU samples are approximately once per second and measure the whole GPU, including other apps; peaks between samples may be missed.

| Run | Excerpt preparation | Adapter preparation | Transcription | Model request | Total | Peak used / minimum free MiB |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Generic 8B, 1 fps, context failure | 2.640 | 1.438 | 0 | HTTP failure; adapter did not record inference duration | 25.672 | 12,268 / 3,710 |
| Generic 8B, 0.5 fps, truncated | 2.063 | 0.656 | 0 | 49.484 | 52.219 | 15,759 / 219 |
| Instruct visual-only, 0.5 fps | 2.015 | 0.735 | 0 | 13.078 | 15.859 | 14,939 / 1,039 |
| Instruct with Whisper, 0.5 fps | 2.125 | 0.687 | 5.078 | 5.703 | 13.656 | 14,810 / 1,168 |

The visual instruct request included 2.886 seconds model load and 4.648 seconds prompt evaluation; commentary reused the warm model and image-prefix cache (0.0067 seconds load, 0.0515 seconds prompt evaluation). Therefore commentary's lower total does **not** show a faster evidence mode. Both produced three cards and three story scenes with `needs-review` status. Reported tokens: visual 11,240 input / 573 output; commentary 11,406 / 570. Ollama's running-model metadata reports 7,811,262,054 bytes both total model allocation and VRAM allocation; `ollama ps` reported 100% GPU. Whole-GPU samples leave only about 1 GiB free in completed runs. No sustained throughput, p95, energy, invoice or learning-quality measurement is established.

## Provisional footage audit — separate from model output

Reviewer: **Codex AI**, not human ground truth or fluent Spanish review. Inspected a separate whole-window 2 fps contact sheet and a 5 fps sheet of recording 812–817. Approximate reference ranges: run/receive 808–813.4, cutback 813.4–814.6, shot/goal 814.6–816.2, then celebration and crowd footage. These are inspection aids, not exact ball-contact/goal-line annotations; allow at least the sampling uncertainty. Identity and finishing foot are not established from the distant frames. No precision/recall percentage is computed from this one development window.

| Aspect | Visual-only result | With local commentary | Footage audit / decision |
| --- | --- | --- | --- |
| Run and cutback | Both absent as action labels | Forward pass 808–814; white shirt credited, blue/red described as defending | Blue/red attack against white defenders; the cutback is a low backward ball near the byline. Commentary did not repair role/direction errors. |
| Finish | Goal 814–816 | Goal 814–816 | Broadly overlaps the finish, but bundles shot and goal; does not give exact contact/crossing. |
| Celebrations | Additional `goal` labels at 816–818 and 818–820 | Additional `goal` label at 816–826 | One goal, not repeated goals. Some hug/celebration descriptions start early, and the longer range includes crowd footage. |
| Scoreboard | First event cites a later scoreboard state as evidence of the earlier goal | Score change included in celebration evidence | Scoreboard still reads 0–0 during the inspected finish and changes later. Exact update boundary remains unannotated; do not use a later overlay to timestamp the shot. |
| Commentary | None asserted | Whisper captures Alba/run and goal call, but mishears Coutinho's first name as “Malibu” | Preserve the transcript; no human listening correction was supplied. The goal event quotes a transcript segment at recording 817–824 for an event timed 814–816. |
| Story | Goal then two celebration scenes | Forward pass, goal, celebration | Structurally valid and traceable, but not the desired run → cutback → finish narrative. Not approved learning content. |

Both models self-report high confidence and empty uncertainty despite errors. Shared validation proves contract shape and bounded times, not football truth, correct evidence timing inside an event, or Spanish quality. Human corrections remain empty/pending. Do not overwrite raw results, substitute the existing corrected pack, or describe this AI audit as human review.

## Match Lab and verification

The existing gateway is configured explicitly for local instruct + local Whisper at 0.5 fps. No default-provider change, duplicated UI or new playback authority. The first actual-provider browser smoke received the exact 808–828 window, but detected the selected card's English face resetting to Spanish. `xr status` confirmed **no active immersive session**. The spatial handheld updater was writing orientation into shared learning state while the desktop controls were in use. It now synchronizes only during an active immersive session; a regression test covers the desktop revealed-face invariant.

Final actual-provider browser evidence is recorded privately in `app/content-source/match-analysis/match-lab-actual-smoke.json`: exactly one 808–828 request, three cards and a three-scene story, 13.92 seconds gateway processing including replay encoding, original selected card/revealed face preserved, deliberate draft selection, English flip, story and muted replay verified. Main playback advanced from 841.986 to 842.353 seconds during the final interactions and stayed unpaused. Analysis was explicitly stopped; a test-only browser request guard blocked any second/out-of-range inference. Physical Quest 3 acceptance in theater and passthrough, hand comfort, simultaneous-video performance, stop/disconnect behavior on device, and fluent Spanish/audio review remain pending. Browser emulation cannot establish those outcomes.

Automated checks on Windows: typecheck, 60 Python tests, 215 Vitest tests, production build and eight affected browser tests passed. Initial browser failures were missing private replays, resolved by local regeneration and rebuilding. Existing font-atlas, dependency-annotation and bundle-size warnings remain. `npm ci` reported seven dependency audit findings (four moderate, three high); no unrelated dependency upgrade was attempted.

## Private evidence and next questions

All paths below are under ignored `app/content-source/match-analysis/`:

- `recognition/windows-visual-vxk_4h9o/`: 1 fps failure, preparation/input metadata, timing and GPU samples.
- `recognition/windows-visual-5d_ei1xr/`: truncated 0.5 fps thinking run, raw response, input, timings and GPU samples.
- `recognition/windows-visual-l1xbi1qx/` and `recognition/windows-commentary-k4pwlu84/`: completed comparable runs; unchanged raw responses, transcripts, drafts, settings, hashes and telemetry.
- `review-ai.json`: separate provisional annotations and an empty `humanCorrections` array. Contact sheets and the local measurement wrapper are private alongside it.
- `recognition/stream/`: actual gateway runs, including a failed UI acceptance attempt; retain all rather than counting only successful journeys. The service's three-attempt/six-call safeguards remain unchanged. The smoke additionally blocked requests outside 808–828.
- `ollama-local-stderr.log`: explicit no-cloud startup and model diagnostics. `match-lab-actual-smoke.json`: actual browser journey evidence.

Next: human review of the ball contacts and commentary, fluent Spanish review, then physical Quest acceptance. Investigate sampling/resolution/context tradeoffs and semantic rejection of celebration-as-goal before accepting fresh content. Compare cold and warm runs deliberately before making latency claims. No full-game run was launched.
