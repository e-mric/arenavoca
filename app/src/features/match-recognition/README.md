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
but **still calls Google**, including when the client is named `localRecognition`.
Do not treat it as local AI or remove its limits for a full-game benchmark.

The latest implementation checks passed typecheck, 204 Vitest tests, production
build and seven prepared-card/theater browser regressions. Fresh-model browser
delivery and physical Quest verification remain pending.

The user will continue on Windows with RTX 5080 / 64 GB system RAM, starting with
local Qwen3-VL and local commentary transcription to reduce inference fees. A
local-only benchmark planner is now implemented (below); the local-provider
adapter and resumable inference runner are still pending.
The current setup instructions, source/media transfer checklist, known pending
work and cost/quality evaluation protocol are in
[PRD.md](../../../../PRD.md), under “Resume here: recorded-match evaluation on
Windows”. No automatic cloud fallback is authorised for local-only mode.

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
