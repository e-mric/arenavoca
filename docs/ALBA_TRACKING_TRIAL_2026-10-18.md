# Alba RF-DETR / ByteTrack trial

Reviewed: 2026-10-18. Actual local model experiment on the Mac, separate from the
[Windows trials](WINDOWS_LOCAL_AI_2026-10-16.md). No cloud inference, training,
prepared-card replacement, live-readiness claim or physical Quest acceptance.

## Goal and comparison

Test whether dense player/ball evidence improves the missing cutback in recording
seconds 808–828. The existing Qwen prompt/schema/review contract is the control;
the paired assisted arm additionally receives measured tracking data and cautions
about its interpretation. Both arms
use identical excerpt bytes, ten 640px images at 0.5 fps, one shared Whisper
transcript, Qwen3-VL 8B instruct, seed 42, temperature 0 and a 32,768-token context.
That context differs from the earlier Windows 16,384-token smoke test: the fresh
paired Mac results are the controlled comparison, not a hardware speed comparison.

Recording SHA-256 matches the Windows source:
`16450bd54c298888f4506383ac98e5b09fc4dd96a736b733ca47e0401b37b638`.
Native video is 1280×720 at 25 fps. Source PTS is decoded directly; the 500 tracked
frames cover recording 808.00–827.96. Frame counters are not used as source clocks.

## Reproduction and provenance

The [feature guide](../app/src/features/match-recognition/README.md#rf-detr--bytetrack-offline-comparison--18-october-2026)
owns commands. [Tracking](../app/src/features/match-recognition/track.py) and the
[paired comparison](../app/src/features/match-recognition/compare_tracking.py) are
standalone tools; the normal viewer/provider is unchanged.

- Environment: Mac16,10, macOS 27.0.1 arm64, 24 GiB unified RAM; PyTorch MPS.
- Installed: RF-DETR 1.11.2, Trackers 2.6.1, Supervision 0.31.0, Torch 2.14.1,
  Torchvision 0.29.1, PyAV 18.1.0, NumPy 2.4.6, faster-whisper 1.2.1.
- Official COCO-pretrained RF-DETR Small checkpoint SHA-256:
  `d81979a9213a2109345158ce9232668df4c1ae52e9b8db3f2ec0a8cbad959b33`.
  Publisher MD5 validation passed; no football fine-tuning was performed.
- Detection threshold 0.1; NMS IoU 0.5. Separate ByteTrack instances for COCO
  person and sports-ball classes. Activation thresholds 0.25/person and 0.15/ball;
  high-confidence splits 0.15/0.1; confirmation one frame; lost buffer 10 at the
  tracker's 30-fps reference. Low thresholds deliberately retain ambiguous balls.
- Histogram-cut candidates reset identities at 819.84, 824.80 and 827.40. These
  are heuristic candidates, not validated shot-boundary labels.
- No missing/predicted position is filled in as an observation. IDs are local
  to each run/shot/class, not named-player identities.
- Qwen digest prefix `0533d74300e4`, matching the earlier instruct checkpoint.
  Whisper Small runs locally on CPU/int8. Its shared raw transcript still
  mishears Coutinho's name; transcription is not ground truth.

Private evidence lives under `app/content-source/match-analysis/` (ignored):

- `recognition/tracking/small-w6l51fbf/`: initial two-second setup smoke, 812–814.
- `recognition/tracking/small-khausel6/`: full tracking JSON, summary, compact
  evidence, source review sheets and silent annotated video; `annotated-h264.mp4`
  is the browser-compatible copy.
- `recognition/comparisons/paired-cjukgcmq/`: shared source/frames/transcript,
  request fingerprints, raw responses and separate reviewed drafts for each arm.
- `tracking-environment.txt`: complete installed package snapshot.

These outputs and weights are not committed or copied into public content.

## Detection and tracking observations

RF-DETR Small loaded in 1.984 seconds; decoding, detection, tracking and video/JPEG
writes took 29.760 seconds for the 20-second clip. This is one unoptimized Mac
run, about 16.8 processed frames/second, excluding downloads and source hashing.
It is not an RTX result or demonstrated sustained live throughput.

| Recorded quantity | Result | Interpretation |
| --- | --- | --- |
| Frames with any sports-ball candidate | 273/500 | Candidate coverage, **not** ball recall or accuracy |
| Frames with an assigned ball-candidate ID | 219/500 | Association/confirmation coverage, **not** correct-ball tracking |
| Total sports-ball candidates | 752 | Several false/duplicate candidates occur in the same frame |
| Assigned sports-ball identities | 49 | Includes false targets and fragmented tracks |

Post-frame MPS samples reached 130,091,520 allocated bytes and 255,639,552 driver
bytes. Sampling after prediction can miss activation peaks; these are not proven
peak GPU requirements or a memory budget for concurrent Qwen operation.

**Visual spot review by Codex AI, not a human annotation set:** the detector finds
the moving ball in some frames, but also labels static pitch marks and other
objects as balls. Spectator detections create many irrelevant person tracks.
Examples around the decisive action:

| Recording time | Inspected ball evidence |
| --- | --- |
| 813.4–813.6 | A plausible true-ball candidate has confidence about 0.75 and the same ID. |
| 814.4 | No ball candidate, despite the visible ongoing play. |
| 814.8 | A weak candidate on the backward-moving ball, confidence 0.106, gets an ID for one frame. |
| 815.0 | The visible ball is detected at confidence 0.420 but lacks a confirmed ID. |
| 815.2–815.4 | A plausible returning-ball track has confidence 0.485–0.526; this ID spans only 815.12–815.44. Duplicate candidates also occur. |

This supplies partial geometric evidence of the backward pass, not a continuous
verified ball trajectory, possession transfer, field calibration or cutback label.

### Corrected provisional visual timing

Closer 5-fps source inspection puts the backward pass roughly at **814.7–815.5**,
followed by the finish. The older **813.4–814.6** AI annotation starts during the
dribble and is too early. Preserve the old trial as historical evidence; use this
new range only as a revised **AI inspection aid**, with at least about 0.1-second
sampling uncertainty and no claimed exact contact or goal-line annotation. This
reference range was not supplied to either model request.

## Paired Qwen / Whisper results

The baseline completed in 242.216 seconds, returned valid schema and five
`needs-review` candidate cards. It labels run 808–814, shot 814–816, goal 816–818,
and two celebration periods as runs at 818–824 and 824–828. **It omits the cutback**
and incorrectly collapses the backward pass into its shot interval. High confidence
and passing validation did not establish factual correctness.

The tracking-assisted request completed in 256.757 seconds. It returned a shot at
818.0–818.4 and two goal candidates at 818.4–818.8 and 818.8–819.2, anchored to the
same alleged net/scoreboard observation. **It also omits the cutback**, loses the
earlier run and places the finish in the aftermath. Review policy v1 withholds
both goals as `goal-aftermath-without-scoring-transition` and withholds their
dependent story. One mistimed shot card remains `needs-review`, demonstrating
that a policy pass still does not guarantee correct actions or timing.

| Comparison | Qwen + Whisper control | Same inputs + tracking evidence |
| --- | --- | --- |
| Cutback label | Missing | Missing |
| Earlier run | Present, 808–814 | Missing |
| Finish | Broad shot 814–816, goal 816–818; contains timing/scoreboard errors | Shot 818–818.4 and duplicate late goals; worse temporal grounding |
| After review | Five candidate cards, three story scenes; not factual approval | One mistimed candidate card, no story; duplicate goals withheld |
| Input/output tokens | 11,726 / 1,017 | 17,996 / 667 |
| Request elapsed | 242.216 s | 256.757 s, plus the separate detector stage |

Both passed response-schema validation; neither recovered the target sequence.
The two requests share frame bytes, transcript, model digest, seed and context.
Sequential arms have different cache/model warmth, so their elapsed times cannot
establish a speedup or slowdown caused by tracking. The assisted model's use of
fine time intervals does not demonstrate accurate time grounding.

**Conclusion:** this COCO-pretrained Small + ByteTrack configuration and compact
coordinate representation did not improve the Alba cutback. Its raw event
descriptions were worse in this paired trial. Keep the setup as an offline
experiment; do not integrate it with prepared cards or claim all tracking-assisted
approaches fail. The next justified experiment would first improve/validate ball
evidence (pitch/spectator exclusion, crop/sliced inference or a suitably licensed
football-trained ball detector), then compare representations and action quality
on additional annotated clips. No training or broader benchmark was performed.

## Verification and limits

The actual detector/track run and both Qwen requests succeeded locally. Automated
verification passed 71 recognition Python tests (including real synthetic-video
PTS/subsampling checks), application typecheck, 297 app unit tests and production
build. Existing font-atlas, dependency annotation and bundle-size warnings remain.
No browser journey was changed; browser/device suites were not rerun. Native
Windows/CUDA, held-out action accuracy, full-match stability and fluent Spanish
review remain unverified.

## Cropped and tiled follow-up

The user authorized closer ball views and asked about repeating on the RTX PC.
Both new runs use the same Small checkpoint, source hash, 808–828 window, native
25 fps, 500 frames, 0.1 threshold, NMS and ByteTrack settings. Person detection
remains full-frame; only ball inference changes. No training or expected action
labels were added.

- **Central crop:** fixed source window `(320,180)–(960,540)`, the middle half of
  each image dimension. It does not follow a labelled ball and excludes the image edges.
- **Four tiles:** overlapping 768×432 windows covering all 1280×720 source pixels.
  Crop-local boxes are offset back to source pixels and merged before tracking.
- The first crop attempt stopped on an RF-DETR/Supervision metadata-key mismatch.
  Numeric detection fields were normalized before merging views; its failed
  folder/log remains private and a regression fixture now covers that contract.

Before reading new detector outputs, Codex AI inspected six source frames at
814.4, 814.6, 814.8, 815.0, 815.2 and 815.4. Approximate ball centres were saved
separately with the source hash and image dimensions. The audit accepts candidate
centres within 12 source pixels and counts at most one hit per inspected point.
These are **six AI visual spot checks on a development clip**, not human ground
truth, a held-out evaluation or a full-clip precision/recall result.

| Ball inference view | Matched inspected points | Matched points with confirmed ID | Other candidates at those frames | Mac processing seconds |
| --- | --- | --- | --- | --- |
| Original full frame | 4/6 | 3/6 | 8 | 29.760 |
| Central crop | 6/6 | 6/6 | 12 | 156.769 |
| Four overlapping tiles | 6/6 | 6/6 | 24 | 333.601 |

At confidence ≥0.5, the matched-point counts are 1/6, 5/6 and 4/6 respectively.
The crop keeps one ID across the four inspected backward-pass frames from
814.8–815.4; the original full-frame run fragments that sequence. Both new views
still switch ID around the dribble/pass transition. Extra off-point detections
remain ambiguous/false targets, not evidence of a better trajectory.

**Detection finding:** closer views recover the two inspected misses and raise
true-ball candidate confidence. The central crop is selected for one Qwen retry
because it ties tiled point coverage with fewer off-point candidates and fewer
model calls. This is an Alba-specific development choice: a fixed crop can miss
play outside its region, while tiling covers the scene at greater compute cost.
The one-off Mac processing times include decode, inference, tracking and writes;
they are not an isolated GPU benchmark or an RTX prediction.

Private follow-up evidence (under the same ignored analysis root):

- `recognition/tracking/small-crop-g6xw1zh0/` and `crop-tile-audit/crop.log`: failed integration attempt.
- `recognition/tracking/small-crop-tbiaujzy/`: completed central-crop run.
- `recognition/tracking/small-tiles-icvc8fs3/`: completed tiled run.
- `recognition/tracking/crop-tile-audit/`: independent point marks, all-view
  audit, source/comparison images, side-by-side H.264 video and logs.

The cropped-evidence Qwen retry reused the
original frame bytes/transcript and rechecked the original baseline request hash
`9d873c238a3cd153317968af13475eb4265c3b5cd682eff78117ca449899c478`
plus model digest. Only the new assisted request was sent; the saved baseline was
not regenerated. It timed out after **300.180 seconds** with no raw response or
draft. Its saved request fingerprint is
`a5881d6c73d94ef683dc67aff0081162f36f6f4ed91281e8d37519c77c90cff6`.
The failed run is `recognition/comparisons/paired-8j73ri5q/`; the error is explicit,
with no automatic retry or cloud fallback. Application verification was also
running during this request, so this is not an isolated throughput measurement.
The experiment's Qwen model was stopped afterwards to release memory.

**Outcome:** detection at the inspected ball positions improved; **cutback action
recognition has not been shown to improve**. There is no new Qwen cutback result
to compare with the original missing-cutback/duplicate-goal outputs. Repeat the
same views and a fresh action comparison on the RTX PC before drawing that conclusion.

The [RTX reproduction guide](WINDOWS_TRACKING_RUN_2026-10-18.md) provides CUDA
kernel checks and equivalent full/crop/tile commands. This Mac experiment does
not establish Windows/CUDA compatibility, throughput or memory use.

Follow-up verification passed 76 recognition Python tests, application typecheck,
297 app unit tests and production build. New cases cover crop-coordinate restoration,
cross-tile duplicate merging, vendor metadata normalization, point-audit missing
evidence, saved-control identity and explicit CUDA-unavailable rejection. CUDA
rejection is a fixture test; actual CUDA execution remains pending. Existing build
warnings remain; no browser/native/headset journey changed or was newly accepted.
