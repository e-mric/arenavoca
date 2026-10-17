# Maintained detection and tracking candidates for ArenaVoca

Reviewed: 2026-10-18. Research and proposed experiment; no adoption, installation, downloaded weights, model execution or new accuracy result. Complements the [older football-summary review](FOOTBALL_SUMMARY_REPO_REVIEW_2026-10-18.md), [recognition synthesis](wiki/recognition.md) and [Windows trials](WINDOWS_LOCAL_AI_2026-10-16.md).

## Recommendation

**Later follow-up on 18 October:** the user authorized setup and an actual [Mac Alba comparison](ALBA_TRACKING_TRIAL_2026-10-18.md). RF-DETR Small/ByteTrack ran, but the assisted Qwen output did not recover the cutback and was worse in this trial. The research below records the original candidate selection, not a claim of successful adoption.

Evaluate **RF-DETR Small/Medium + Roboflow Trackers + Supervision** as an offline evidence stage alongside our existing Qwen and faster-whisper analysis. Start with ByteTrack, compare BoT-SORT on camera pans, and preserve the existing reviewed moment contract. This is an engineering hypothesis, not evidence that the combination detects passes, cutbacks or goals accurately.

An **Ultralytics YOLO + built-in tracking** implementation is a credible alternative comparison, particularly if a suitable football-trained checkpoint is available with documented terms. A detector checkpoint, tracker implementation and football action recognizer are different components; none of these tools alone supplies ArenaVoca's temporal Spanish learning moments.

## Maintenance evidence

GitHub API latest-release and default-branch commit metadata were checked directly on the review date. These are snapshots, not ongoing maintenance guarantees. `pushed_at` and repository age alone were not used as evidence of recent source maintenance.

| Candidate | Observed published release | Default-branch source activity | Fit |
| --- | --- | --- | --- |
| [Roboflow Trackers](https://github.com/roboflow/trackers) | [2.6.1, 25 September 2026](https://github.com/roboflow/trackers/releases/tag/2.6.1) | [15 October 2026](https://github.com/roboflow/trackers/commit/7f454c8e9338ae6d24c996f8d26ae9120b20d6f8) | Detector-independent tracking; compare inexpensive association with camera-motion compensation. |
| [Supervision](https://github.com/roboflow/supervision) | [0.31.0, 16 October 2026](https://github.com/roboflow/supervision/releases/tag/0.31.0) | [17 October 2026](https://github.com/roboflow/supervision/commit/1fb42a45f8d223909480bdeef9ec19b30a646afb) | Detection representation, annotation, sliced inference and evaluation utilities. |
| [RF-DETR](https://github.com/roboflow/rf-detr) | [1.11.2, 4 October 2026](https://github.com/roboflow/rf-detr/releases/tag/1.11.2) | [16 October 2026](https://github.com/roboflow/rf-detr/commit/5b22dfc0940697ce1abdfa681a5f7392b3eddbfb) | Local Python detector candidate; validate small-ball performance. |
| [Ultralytics](https://github.com/ultralytics/ultralytics) | [8.4.181, 17 October 2026](https://github.com/ultralytics/ultralytics/releases/tag/v8.4.181) | [17 October 2026](https://github.com/ultralytics/ultralytics/commit/0a19485d41d799e32026846d6800565e67054dc2) | Integrated detector/tracker alternative. |

The default branch may contain unreleased features. Pin released versions and a complete environment for any experiment rather than copying a current development README verbatim.

## What the code supports

**Trackers:** released 2.6.1 exposes `ByteTrackTracker` and `BoTSORTTracker` through the same package. ByteTrack associates detections using confidence and motion; BoT-SORT additionally compensates camera movement. Its implementation scope should not be confused with every feature in the original papers: Roboflow notes that appearance/ReID branches are excluded. [Released exports](https://github.com/roboflow/trackers/blob/2.6.1/src/trackers/__init__.py), [BoT-SORT documentation](https://github.com/roboflow/trackers/blob/7f454c8e9338ae6d24c996f8d26ae9120b20d6f8/docs/trackers/botsort.md).

ByteTrack's released `update()` accepts a `timestamp` in seconds, allowing explicit source presentation times instead of inferring time from processed-frame indexes. This cannot recover a ball that was invisible between sparse frames. Track sufficiently dense consecutive source frames and retain misses as missing evidence. [Released timestamp contract](https://github.com/roboflow/trackers/blob/2.6.1/src/trackers/core/bytetrack/tracker.py#L119-L151).

**Version trap:** Supervision 0.31.0 actually removes `sv.ByteTrack`; use `ByteTrackTracker` from `trackers`, with `update()` replacing `update_with_detections()`. This is already a removal, not merely a future deprecation. [Released changelog](https://github.com/roboflow/supervision/blob/0.31.0/docs/changelog.md#L45).

**RF-DETR:** local inference and multiple model sizes offer a bounded comparison. COCO-pretrained detection is a starting point, not football-specific team/role recognition or proof of tiny-ball recall. Publisher accuracy and speed tables use other datasets/hardware; they do not establish our Windows RTX 5080 16 GB throughput or improvement over Qwen. [Released model interface and benchmark conditions](https://github.com/roboflow/rf-detr/blob/1.11.2/README.md).

**Ultralytics:** its maintained tracking API supports local video and explicit tracker choices, including ByteTrack and BoT-SORT. Tracking IDs refer to associated objects, not verified player identities. The currently documented YOLO27 is an unreleased preview; do not select it from the repository description alone. [Official tracking documentation](https://docs.ultralytics.com/modes/track/).

## Football-specific repositories

[Roboflow Sports](https://github.com/roboflow/sports) is useful reference code for separate ball detection, tiled inference and pitch projection. Its inspected default-branch commit is [27 May 2025](https://github.com/roboflow/sports/commit/42c80c06b6b65a7f89455b89fe31cdf4c38ba227), despite later repository pushes and a 2026 demo-assets release. The soccer example still calls removed `sv.ByteTrack`, so it is not a current drop-in stack. [Soccer source](https://github.com/roboflow/sports/blob/42c80c06b6b65a7f89455b89fe31cdf4c38ba227/examples/soccer/main.py#L207-L258).

[SoccerNet Game State](https://github.com/SoccerNet/sn-gamestate) offers a substantially deeper athlete/pitch/team/jersey research baseline. Its [2 May 2026 update](https://github.com/SoccerNet/sn-gamestate/commit/1c958345067218297d221e45e1a6405f975f83e0) follows [TrackLab 1.3.24, 1 May 2026](https://github.com/TrackingLaboratory/tracklab/releases/tag/v1.3.24). More football-specific does not mean easier integration: the documented environment includes older Python/CUDA/MMCV dependencies and multiple models. Keep it as a later comparison if pitch coordinates or team identity becomes necessary; it is not a ball/event recognizer replacement. [Pinned baseline description and installation](https://github.com/SoccerNet/sn-gamestate/blob/1c958345067218297d221e45e1a6405f975f83e0/README.md).

## Licensing and provenance

- Trackers code is [Apache-2.0](https://github.com/roboflow/trackers/blob/2.6.1/LICENSE); Supervision code is [MIT](https://github.com/roboflow/supervision/blob/0.31.0/LICENSE.md).
- RF-DETR's Apache license covers its open package and **Apache-designated weights**, not every model carrying the name. Release 1.11.2 designates Nano/Small/Medium/Large detection models Apache-2.0; Plus XL/2XL detection components use PML 1.0. The inspected development README additionally lists Atto/Femto/Pico under Plus/PML. Record the exact checkpoint and its terms. [Released distinction](https://github.com/roboflow/rf-detr/blob/1.11.2/README.md#license), [development model table](https://github.com/roboflow/rf-detr/blob/5b22dfc0940697ce1abdfa681a5f7392b3eddbfb/README.md#L214-L226).
- RF-DETR's designated models use DINOv2; upstream distinguishes ordinary DINOv2 code/weights (Apache-2.0) from other specialized model families with different terms. Do not infer all backbone/checkpoint licenses from one repository badge. [Pinned upstream license section](https://github.com/facebookresearch/dinov2/blob/7764ea0f912e53c92e82eb78a2a1631e92725fc8/README.md#license).
- Ultralytics provides [AGPL-3.0 source](https://github.com/ultralytics/ultralytics/blob/0a19485d41d799e32026846d6800565e67054dc2/LICENSE) and an [Enterprise licensing route](https://www.ultralytics.com/license). Resolve the intended integration and checkpoint terms before redistribution; a generic assertion that commercial use always requires payment would be inaccurate.
- SoccerNet Game State code is [GPL-3.0](https://github.com/SoccerNet/sn-gamestate/blob/1c958345067218297d221e45e1a6405f975f83e0/LICENSE), while TrackLab code is MIT. Dependencies, model weights, third-party football datasets and broadcast footage have separate provenance/terms. A permissive utility license does not clear them.

## Proposed bounded experiment and acceptance evidence

Keep the recorded-match viewer and prepared-card behavior unchanged. A separate offline worker would decode bounded clips with source timestamps, generate boxes/tracks/confidence/gaps, and save auditable evidence for existing Qwen + commentary analysis. Our [current provider](../app/src/features/match-recognition/local_model.py) builds an image/text request and has no tracking input, so an explicit evidence adapter and evaluation are required.

Use reviewed clips covering the Alba cutback, an ordinary pass, a missed shot/save, a celebration/replay and a camera cut. Compare unchanged Qwen + commentary against detector-assisted analysis. Check ball visibility/false detections, player ID changes, cutback/pass correctness, time-boundary error, false goals/replay duplicates, elapsed processing time and peak VRAM. Treat tiny-ball tiling and football fine-tuning as later options only if measured errors justify them.

Preserve actual source time through decoding and subsampling; reset state at hard cuts and name IDs by recording/shot/run so overlapping windows cannot imply shared identities. Camera compensation does not itself identify attacking direction or prove that a pass is backwards relative to the byline. Measure adequate frame density and report lost-ball gaps rather than filling them with certainty.

The existing 16 GB GPU trials had limited headroom while Qwen was resident. Begin with sequential detector/Qwen stages or cached evidence and measure memory; concurrent operation, native Windows compatibility and real-time speed remain unverified. Keep raw visual/commentary uncertainty and human review, and do not publish recognition results directly as accepted Spanish cards.

**Open questions:** which available football checkpoint has suitable terms and small-ball recall; whether more reliable ball tracks improve action accuracy enough to justify cost; whether pitch calibration is necessary for cutbacks; and whether the measured local latency meets the eventual recognition target. No full-game, live, Spanish-review or Quest acceptance follows from this source review.
