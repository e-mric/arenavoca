# Match recognition experiment

Analyze a short audiovisual passage, then review the proposed events and Spanish.
This local authoring tool does not run in the headset or change its prepared cards.
It does not train a model. Football and F1 have separate allowed action labels.

From `app/`, prepare Alba's sequence **without uploading**:

```sh
python3 src/features/match-recognition/recognize.py \
  --video public/media/user/barca-2018-h264.mp4 \
  --source-id barca-2018-full --start 808 --duration 20
```

Python 3 and ffmpeg/ffprobe are required. No extra Python packages are needed.
To analyze, set `GEMINI_API_KEY` in ignored `app/.env.local` (never `VITE_`), then
repeat with `--analyze`. That explicitly sends the selected excerpt **including its
audio** to Google, with `store: false` (disables interaction retrieval storage;
this is not a guarantee about all provider retention). Default model:
`gemini-3.8-flash`; `--model` can select another compatible available model.
One bounded request, no retry loop or background whole-match upload.

### Google Cloud route (selected for ArenaVoca)

Agent Platform / Vertex AI uses the existing `arenavoca` Cloud project instead of
AI Studio billing. Enable `aiplatform.googleapis.com`, install the Google Cloud CLI,
and complete `gcloud auth application-default login --project=arenavoca` once.
Credentials stay in Google's local credential store, outside the repository.
The caller needs model inference permissions (Agent Platform User or equivalent).

Add `--project arenavoca --analyze` to the preparation command above. The tool
obtains a short-lived ADC bearer token and calls the project-scoped global
Interactions endpoint. It does not read the Gemini key on this route, change the
active gcloud project, or alter cloud IAM/billing settings. Project identifiers are
validated and the endpoint is fixed. The report records which route/project was
used; credentials are never written into it. Google Cloud CLI was installed on
the development Mac and ADC sign-in completed on 15 October 2026.

Trial-credit applicability must be checked in the project's billing report;
a successful inference request alone does not establish that credits covered it.
No trial-credit balance or spend cap is inferred from the API response.

Each invocation prints a new private output directory under
`app/content-source/match-analysis/recognition/`. It contains `excerpt.mp4`,
`source.json` and, only on successful analysis, `draft.json`. These files are
ignored by Git. The prepared 960px excerpt retains audio; model sampling is 4 fps.
Sampling can still miss a fast ball; this is a starting setting, not measured
optimal quality. No existing card, player name or expected outcome is supplied
to the model. It gets only sport, clip duration, media and the analysis instructions.

Draft observations separate visual and commentary claims. Clip-relative times are
converted once to recording time. Story sentences reference event IDs. Invalid
results fail closed; uncertain/replay observations are retained for review but
withheld from candidate cards. A story referencing a withheld event is withheld
as a whole. High model confidence is not calibrated accuracy. All accepted
candidates remain `needs-review`; there is no automatic publishing/import.
Repeated runs of a clip have stable event IDs if its bytes and event order match.
This standalone authoring command does not deduplicate overlapping clips.

## Development status and Windows handoff · 15 October 2026

The adjacent `stream.ts` and `serve.py` add an experimental recorded-as-live path
with overlapping-window deduplication and strict request limits. The optional
`?recognition=1` controls are not a completed live service. The server runs locally
with explicit Ollama or Gemini selection. The `localRecognition` client name
refers to the gateway, not the selected inference provider. The default is still
Gemini; use the explicit local command below. Keep the runtime request limits.

Verification on 16 October passed typecheck, 58 Python tests, 214 Vitest tests,
production build and eight browser tests, including fixture-backed local draft
delivery. Actual model delivery and physical Quest verification remain pending.
Existing font-atlas accent and bundle-size warnings remain.

The user will continue on Windows with RTX 5080 / 64 GB system RAM, starting with
local Qwen3-VL and local commentary transcription to reduce inference fees. A
local-only benchmark planner and short-excerpt Ollama adapter are implemented
(below); actual Windows model evaluation and the resumable inference runner are
still pending. `serve.py` now also supports the local provider for Match Lab.
The current setup instructions, source/media transfer checklist, known pending
work and cost/quality evaluation protocol are in
[PRD.md](../../../../PRD.md), under “Resume here: recorded-match evaluation on
Windows”. No automatic cloud fallback is authorised for local-only mode.

## Local Ollama adapter · 16 October 2026

The adapter uses the existing event/card/story schema and review rules. It sends
ordered JPEG samples and optional locally transcribed commentary to Ollama on
`127.0.0.1:11434`. It does not send the MP4/audio to Qwen directly. Sampled frames
can miss a fast ball; this is a different input representation from Gemini video.
It never reads cloud credentials, pulls a model, follows HTTP redirects, uses a
system proxy or falls back to Gemini. Only installed `qwen3-vl:8b` and
`qwen3-vl:4b` are accepted, with vision capability and no remote-model metadata.
Keep `OLLAMA_NO_CLOUD=1` enabled in the Ollama process as described in the PRD.

### Windows: first visual smoke test

Install/start Ollama, explicitly download the selected model with
`ollama pull qwen3-vl:8b`, and verify the recording/FFmpeg setup from the PRD.
From `app/`, using Python 3.12 (or your installed Python 3.11), prepare evidence:

```powershell
py -3.12 src/features/match-recognition/recognize.py --provider ollama --visual-only --video public/media/user/barca-2018-h264.mp4 --source-id barca-2018-full --start 808 --duration 20
```

This encodes the bounded excerpt and extracts **20 frames at 1 fps, 640 px wide**.
It makes no model calls, even if Ollama is running. Add `--analyze` to the same
command for one local inference request. `--model qwen3-vl:4b` selects an explicitly
installed alternative. `--fps` accepts 0.5–4 with 2–48 frames per excerpt; excessive
requests are rejected rather than silently undersampled. Choose higher sampling
only after inspecting memory use and quality. Sample times are clip-relative seek
targets and may round to a decoded frame boundary.

The request uses a schema-constrained JSON response, deterministic generation
settings, a 16,384-token context and a 2,048-token output cap. Truncated responses
are rejected. No automatic retry: lower sampling or investigate the failure
before an explicit new run. `--local-timeout` defaults to 180 seconds, maximum 300;
this bounds the HTTP wait, not a guarantee that Ollama stops GPU work immediately.

### Windows: add local commentary

Download/install dependencies once, deliberately. This setup may access the
internet; subsequent analysis requires only local model files. CPU/int8 Whisper
leaves GPU memory for Qwen; GPU transcription is a separate later comparison.
The virtual environment and weights below stay in the ignored analysis folder.

```powershell
py -3.12 -m venv content-source/match-analysis/.venv
.\content-source\match-analysis\.venv\Scripts\python.exe -m pip install "faster-whisper>=1.2,<2"
.\content-source\match-analysis\.venv\Scripts\python.exe -c "from huggingface_hub import snapshot_download; snapshot_download('Systran/faster-whisper-small', local_dir='content-source/match-analysis/models/whisper-small')"
.\content-source\match-analysis\.venv\Scripts\python.exe src/features/match-recognition/recognize.py --provider ollama --whisper-model content-source/match-analysis/models/whisper-small --video public/media/user/barca-2018-h264.mp4 --source-id barca-2018-full --start 808 --duration 20 --analyze
```

The folder must contain `model.bin`, `config.json` and `tokenizer.json`; a model
name alone is rejected. Whisper receives only the prepared excerpt, with no
previous transcript/history. Out-of-range or unordered transcript segments fail
validation. If audio is absent, choose `--visual-only` explicitly; failures do not
silently change the evidence mode. Transcription can hallucinate or mishear names:
it is evidence for review, not ground truth. No supplied full-match transcript or
reference answers enter the request.

### Outputs and verification limits

Each run uses a fresh ignored `content-source/match-analysis/recognition/run-*`
directory. Keep these private when transferring to Windows. Preparation writes
`excerpt.mp4`, `source.json`, JPEG frames and `frames.json`. Analysis adds:

- `transcript.json`: clip-relative segments, or explicit visual-only metadata.
- `input.json`: prompt, evidence timing, settings and source/frame hashes, with
  image bytes kept in the separate frame files.
- `raw-response.json`: unchanged model response, preserved before card validation.
- `analysis.json`: model digest/Ollama version, transcription model-file hashes and
  package version, sampling/settings, request fingerprint, timings, token counts
  and running-model telemetry where available. Failed validation remains a failed
  run even when the HTTP request succeeded. Adapter timings exclude the initial
  excerpt encoding and whole-recording hash; they are not full end-to-end latency.
- `draft.json`: only after successful validation. Replay/uncertain events are
  withheld; accepted cards still need factual and fluent Spanish review. Without
  a transcript, any asserted commentary causes rejection.

The Mac verification used actual Alba excerpt/frame preparation plus synthetic
responses through a loopback HTTP test server. **No real Ollama/Whisper model was
run.** Windows dependency compatibility, model speed, GPU residency, Spanish
quality and full-game accuracy remain unverified. Check `ollama ps` and
`nvidia-smi` during the first PC run; telemetry is not automatically an accuracy or
energy measurement. The three/six-request runtime limits and playback behaviour
are preserved in the new Match Lab integration below. Full-game execute/resume
remains later work; `benchmark.py` still only prepares the schedule.

Implementation references checked 16 October 2026:
[Ollama chat](https://docs.ollama.com/api/chat),
[vision input](https://docs.ollama.com/capabilities/vision),
[model metadata API](https://github.com/ollama/ollama/blob/main/api/types.go),
[faster-whisper](https://github.com/SYSTRAN/faster-whisper).

## Match Lab local service · 16 October 2026

After the recording, FFmpeg and Ollama setup above, run from `app/` in a separate
Windows PowerShell terminal:

```powershell
py -3.12 src/features/match-recognition/serve.py --provider ollama --visual-only
```

For commentary, use the environment/model folder already prepared above instead:

```powershell
.\content-source\match-analysis\.venv\Scripts\python.exe src/features/match-recognition/serve.py --provider ollama --whisper-model content-source/match-analysis/models/whisper-small
```

These are alternatives: stop the first service with Ctrl+C before starting the
second. Both listen only on `127.0.0.1:8788`. The app proxies `/api/recognition` to
that service; the headset never connects directly to Ollama. No Gemini key or
Google sign-in is needed for local mode. Optional `--model qwen3-vl:4b`, `--fps 2`
and `--local-timeout 240` have the same meaning as in the authoring command.
Sampling must fit a full 20-second window within 48 frames; `--fps 4` is rejected
at startup. Models are never downloaded automatically.

Start the managed app separately:

```powershell
npx @iwsdk/cli dev up --open --timeout 45000
```

Open the runtime URL printed by that command with `?recognition=1` added. For
Quest, use the established headset pairing/local-certificate workflow in
`app/AGENTS.md`, retaining the query parameter. Keep the app and Python service
on the same PC. The standard production preview also forwards this route; both
proxies allow up to 15 minutes of inactive socket wait for local processing.
That is a transport ceiling, not a latency target or a cancellation guarantee.

1. Enter the match in theater or passthrough. For the Alba smoke test, seek to
   recording **13:28 (808 seconds)** before starting analysis.
2. Open Match Lab. Confirm its notice says **Local AI / frames only** or
   **Local AI / frames + local commentary**. If unavailable, fix/start the PC
   service and press **Check service**. Checking never also starts analysis.
3. Press **Start analysis** and let at least 20 seconds play normally. Pausing
   stops collection; seeking ends this analysis run. Processing may take longer
   than playback: there is one request at a time, no queued backlog.
4. New results appear under **New drafts**. Your selected/flipped card stays
   pinned until you choose the drafts. Flip a new card, open its story and play
   its separate muted replay. The main match keeps its own playback state.
5. Press **Stop analysis** to discard pending results. This does not guarantee
   immediate cancellation of GPU work; the server stays busy until work finishes.
   Three attempts end one test; six end the process budget. Sessions expire after
   five minutes for new requests, so very slow local runs may yield fewer cards.

The browser reads a non-secret configuration (provider/model/evidence mode) and
binds Start to that service instance. If the service is restarted or changed to
cloud, the old Start fails before inference; check the notice again and explicitly
Start. To deliberately compare Google, restart with
`python src/features/match-recognition/serve.py --provider gemini --project arenavoca`
and complete the existing Cloud setup. This route uploads played video/audio.
There is no automatic retry or cloud fallback in local mode.

Local outputs are private under
`content-source/match-analysis/recognition/stream/<job>/`: the same evidence,
raw response, model/timing metadata and draft files as the authoring adapter,
plus silent replay MP4s. The browser receives only validated draft observations,
evidence text, story references, bounded replay URLs and elapsed processing time.
Replay/uncertain events stay withheld. Elapsed time includes excerpt preparation,
analysis and replay encoding, but excludes waiting for footage and network/UI
presentation. No matches, transcripts, frames or model weights belong in Git.

Verification uses synthetic model responses through the real adapter/service
contract and a separate browser fixture to exercise draft selection, flip, story,
muted replay and uninterrupted main playback. It is not model-quality evidence.
**Pending Quest-only acceptance:** on Windows with the actual model, repeat the
five steps in both theater and passthrough; check the notice, draft arrival,
readability, hand-grab/flip and independent replay. Also stop during processing
and disconnect Ollama: no late cards, no cloud fallback, match keeps playing.
Spanish content and prototype audio still require fluent review.

## Full-recording preparation · 16 October 2026

This works on the Mac now and uses the same Python/ffprobe setup on Windows.
From `app/`, run:

```sh
python3 src/features/match-recognition/benchmark.py --video public/media/user/barca-2018-h264.mp4 --source-id barca-2018-full
```

It only probes/hashes the recording and plans 20-second windows at 16-second
intervals. No model is loaded, no credentials read, no media extracted and no
inference/upload performed. A new ignored directory under
`content-source/match-analysis/recognition/benchmarks/` receives:

- `manifest.json`: source fingerprint, duration, audio presence, schedule,
  per-window evidence watermarks and expected request count.
- `review.csv`: all windows, including any tail shorter than two seconds (marked
  `skip-too-short`). Review fields are blank, never fabricated zero-error scores.

The actual Mac recording produced **373 planned windows**, ending at
**5,960.794558 seconds**, with an **8.794558-second final window**. Its hash matches
the PRD transfer reference. Inference requests made: **zero**. This verifies the
schedule, not model quality, latency, cost or GPU performance. The script currently
has no execute/resume command. Freeze provider/model, prompt, sampling and
transcription configuration before adding execution; `planId` is not a sufficient
inference-cache key. Do not sum overlapping durations as unique coverage.

Review/reference annotations must remain outside model inputs. Decide annotation
matching/tolerance and a held-out set before scoring; the worksheet alone does not
compute accuracy. New preparation runs preserve previous review files. The
schedule stores no machine-specific absolute recording path and can be recreated
after verifying the copied recording's hash on Windows.

Feature tests (including existing recognition/service tests):

```sh
python3 -m unittest discover -s src/features/match-recognition -p 'test_*.py'
```

## First evaluation

Review these independently of the prompt; don't send expected answers as context.
The existing reviewed-by-AI pack is a comparison aid, not ground truth certified by
a football expert or fluent Spanish speaker.

- Recording 808–828: run, backward pass/cutback, finish. Compare against the existing
  `alba-run`, `alba-cutback`, `coutinho-goal` evidence; inspect exact boundaries.
- Recording 638–668: Bale's run/cross and Benzema's volley that goes high. Check that
  the model does not convert a shot or excited commentary into a goal.
- Select and label a broadcast replay and a no-action interval manually. They must
  not create new match events. These ranges have not yet been reviewed here.
- Add reviewed F1 overtaking/braking/pit-entry clips before claiming F1 accuracy.

Record missed/false events, alignment error, wrong translations, replay mistakes,
request latency and reported token usage. Evaluate ambiguous and silent footage,
not just successful moments. Fluent Spanish review remains pending. Mocked unit
checks prove parser/policy behavior, not the model's recognition accuracy.

## Later inputs

The same analysis contract can accept an audiovisual excerpt from a TV crop, with
capture-relative timestamps and a distinct source kind; that adapter is not built.
Test Quest camera access + microphone + immersive session on device first. Avoid
full-room upload. In-app analysis should eventually run behind an authenticated
backend with a bounded queue, discontinuity handling on seek, duplicate suppression,
no spoilers, and explicit enable/stop. Inference must never control match playback.

Sources checked 14 October 2026:
[Gemini video input](https://ai.google.dev/gemini-api/docs/video-understanding),
[structured output](https://ai.google.dev/gemini-api/docs/structured-output),
[Interactions API](https://ai.google.dev/api/interactions-api),
[Meta camera overview](https://developers.meta.com/vr/documentation/unity/unity-pca-overview/),
[Meta browser camera permission investigation](https://developers.meta.com/vr/support/investigations/1557993751977106/).
The investigation is evidence to test permissions, not proof of a universal current
failure. Passthrough display by itself does not establish raw-camera access.
