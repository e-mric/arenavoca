"""Offline RF-DETR/ByteTrack evidence; never publishes cards or controls playback."""
import argparse
import importlib.metadata
import json
import math
import os
from pathlib import Path
import platform
import tempfile
import time

from recognize import sha256, validate_window
from ball_views import detect_ball_views, source_windows

ROOT = Path(__file__).resolve().parents[3]
PRIVATE = ROOT / 'content-source/match-analysis'
LABELS = {1: 'person', 37: 'sports ball'}


def recording_seconds(clip_seconds, recording_start):
    """Convert the clip timebase exactly once; processing indexes are not clocks."""
    if any(type(x) not in (int, float) or not math.isfinite(x) or x < 0
           for x in (clip_seconds, recording_start)):
        raise ValueError('Times must be finite nonnegative seconds.')
    return recording_start + clip_seconds


def sampled_frames(video, start, duration, fps):
    """Decode using container PTS; preserve actual source times through sampling."""
    import av
    validate_window(start, duration)
    if not math.isfinite(fps) or not 1 <= fps <= 60:
        raise ValueError('Tracking sampling must be 1–60 fps.')
    with av.open(str(video)) as container:
        stream = container.streams.video[0]
        origin = (stream.start_time or 0) * stream.time_base
        if stream.duration is not None and start + duration > float(stream.duration * stream.time_base) + .001:
            raise ValueError('Tracking window extends beyond the source video.')
        container.seek(int((start + float(origin)) / stream.time_base), stream=stream)
        next_sample, previous = start, -1.0
        for frame in container.decode(stream):
            if frame.pts is None:
                raise ValueError('Frame has no presentation timestamp.')
            seconds = float(frame.pts * stream.time_base - origin)
            if seconds < previous:
                raise ValueError('Decoded frames are not chronological.')
            previous = seconds
            if seconds + 1e-7 < start:
                continue
            if seconds >= start + duration - 1e-7:
                break
            if seconds + 1e-7 >= next_sample:
                yield seconds - start, frame.to_ndarray(format='rgb24')
                next_sample = start + (math.floor((seconds - start) * fps + 1e-6) + 1) / fps


def detection_rows(detections, width, height, shot):
    """Only observed boxes; no synthetic locations for absent or unconfirmed tracks."""
    result = []
    for i, (box, label, confidence) in enumerate(zip(
            detections.xyxy, detections.class_id, detections.confidence)):
        if int(label) not in LABELS:
            continue
        x1, y1, x2, y2 = [float(x) for x in box]
        values = [x1, y1, x2, y2, float(confidence)]
        if not all(math.isfinite(x) for x in values) or x2 <= x1 or y2 <= y1:
            raise ValueError('Invalid detector box.')
        identity = None if detections.tracker_id is None else int(detections.tracker_id[i])
        identity = None if identity is None or identity < 0 else f'{shot}:{int(label)}:{identity}'
        result.append({'classId': int(label), 'label': LABELS[int(label)],
                       'confidence': round(float(confidence), 5), 'trackId': identity,
                       'xyxy': [round(v, 2) for v in (x1, y1, x2, y2)],
                       'centerNormalized': [round((x1 + x2) / (2 * width), 5),
                                            round((y1 + y2) / (2 * height), 5)]})
    return result


def compact_evidence(tracking, interval=.2):
    """Bounded measured ball samples, without inferred possession or action labels."""
    source = tracking['source']
    samples, due = [], 0.0
    for row in tracking['frames']:
        seconds = row['clipSeconds']
        if seconds + 1e-7 < due:
            continue
        due = seconds + interval
        balls = [d for d in row['detections'] if d['classId'] == 37]
        people = [d for d in row['detections'] if d['classId'] == 1]
        # Preserve all ball candidates and gaps. Nearest people are geometric hints, not possession.
        measured = []
        for ball in balls:
            x, y = ball['centerNormalized']
            nearest = sorted(people, key=lambda p: (p['centerNormalized'][0] - x) ** 2 +
                             (p['xyxy'][3] / tracking['metadata']['height'] - y) ** 2)[:2]
            measured.append({'xy': ball['centerNormalized'], 'confidence': ball['confidence'],
                             'trackId': ball['trackId'],
                             'nearbyPeople': [{'trackId': p['trackId'],
                                               'xy': [p['centerNormalized'][0], round(
                                                   p['xyxy'][3] / tracking['metadata']['height'], 5)]}
                                              for p in nearest]})
        samples.append({'seconds': seconds, 'shot': row['shot'], 'ballCandidates': measured})
    return {'clipSha256': source.get('clipSha256'), 'recordingSha256': source['recordingSha256'],
            'startSeconds': source['startSeconds'], 'durationSeconds': source['durationSeconds'],
            'timebase': 'clip-relative-seconds', 'coordinateMeaning': 'normalized image x/y, not pitch coordinates',
            'limitations': 'COCO detections; false balls possible; IDs are local to a shot/run. '
                           'Empty candidates mean missing evidence. No interpolation or verified possession.',
            'samples': samples}


def run(args):
    import av
    import cv2
    import torch
    import supervision as sv
    from rfdetr import RFDETRSmall, RFDETRMedium
    from rfdetr.assets.model_weights import download_pretrain_weights
    from trackers import ByteTrackTracker

    validate_window(args.start, args.duration)
    if not 1 <= args.fps <= 60 or not 0 < args.threshold < 1:
        raise ValueError('Invalid fps or detection threshold.')
    hardware = {'torchCudaBuild': torch.version.cuda}
    if args.device == 'cuda':
        if not torch.cuda.is_available():
            raise ValueError('CUDA requested but unavailable. Install a CUDA-enabled PyTorch build; no CPU fallback.')
        # Verify an actual kernel, not just device enumeration, on the requested PC.
        smoke = torch.ones((8, 8), device='cuda')
        _ = smoke @ smoke
        torch.cuda.synchronize()
        del smoke
        torch.cuda.reset_peak_memory_stats()
        hardware.update({'cudaDevice': torch.cuda.get_device_name(0),
                         'cudaCapability': list(torch.cuda.get_device_capability(0))})
    weights_dir = PRIVATE / 'models/rfdetr'
    weights_dir.mkdir(parents=True, exist_ok=True)
    weights = weights_dir / f'rf-detr-{args.model}.pth'
    if not weights.is_file():
        if not args.download_weights:
            raise ValueError('Weights absent; use --download-weights explicitly for initial setup.')
        download_pretrain_weights(str(weights))
    os.environ['HF_HUB_OFFLINE'] = '1'
    os.environ['TRANSFORMERS_OFFLINE'] = '1'
    output_root = PRIVATE / 'recognition/tracking'
    output_root.mkdir(parents=True, exist_ok=True)
    output = Path(tempfile.mkdtemp(prefix=f'{args.model}-{args.ball_view}-', dir=output_root))
    print(output, flush=True)
    source = {'id': args.source_id, 'recordingSha256': sha256(args.video),
              'startSeconds': args.start, 'durationSeconds': args.duration,
              'timebase': 'recording-seconds'}
    started = time.monotonic()
    model = {'small': RFDETRSmall, 'medium': RFDETRMedium}[args.model](
        pretrain_weights=str(weights), device=args.device)
    loaded = time.monotonic()
    trackers, frames, shot, previous_hist = {}, [], 0, None
    writer = None
    peak_allocated, peak_driver = 0, 0
    try:
        for index, (clip_time, rgb) in enumerate(sampled_frames(
                args.video, args.start, args.duration, args.fps)):
            height, width = rgb.shape[:2]
            hsv = cv2.cvtColor(cv2.resize(rgb, (160, 90)), cv2.COLOR_RGB2HSV)
            hist = cv2.calcHist([hsv], [0, 1], None, [32, 32], [0, 180, 0, 256])
            cv2.normalize(hist, hist)
            cut_score = 0 if previous_hist is None else cv2.compareHist(
                previous_hist, hist, cv2.HISTCMP_BHATTACHARYYA)
            cut = previous_hist is not None and cut_score > .55
            if cut:
                shot += 1
                trackers = {}
            previous_hist = hist
            with torch.inference_mode():
                detected = detect_ball_views(model, rgb, args.threshold, args.ball_view)
            raw_rows = detection_rows(detected, width, height, shot)
            tracked_parts = []
            for class_id in LABELS:
                if class_id not in trackers:
                    trackers[class_id] = ByteTrackTracker(frame_rate=args.fps,
                        track_activation_threshold=.25 if class_id == 1 else .15,
                        high_conf_det_threshold=.15 if class_id == 1 else .1,
                        minimum_consecutive_frames=1, lost_track_buffer=10)
                tracked_parts.append(trackers[class_id].update(
                    detected[detected.class_id == class_id], timestamp=clip_time))
            tracked = sv.Detections.merge(tracked_parts)
            rows = detection_rows(tracked, width, height, shot)
            # Include detector observations rejected by track confirmation as unassigned evidence.
            identities = {(d['classId'], tuple(d['xyxy'])): d['trackId'] for d in rows}
            for row in raw_rows:
                row['trackId'] = identities.get((row['classId'], tuple(row['xyxy'])))
            frames.append({'clipSeconds': round(clip_time, 6),
                           'recordingSeconds': round(recording_seconds(clip_time, args.start), 6),
                           'shot': shot, 'cutCandidate': bool(cut), 'cutScore': round(cut_score, 5),
                           'detections': raw_rows})
            bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
            for row in raw_rows:
                box = [int(v) for v in row['xyxy']]
                color = (0, 210, 255) if row['classId'] == 37 else (255, 160, 40)
                cv2.rectangle(bgr, tuple(box[:2]), tuple(box[2:]), color, 2)
                if row['classId'] == 37:
                    cv2.circle(bgr, ((box[0] + box[2]) // 2, (box[1] + box[3]) // 2), 12, color, 2)
                cv2.putText(bgr, f"{row['label']} {row['confidence']:.2f} {row['trackId'] or '?'}",
                            (box[0], max(45, box[1] - 4)), cv2.FONT_HERSHEY_SIMPLEX, .35, color, 1)
            cv2.putText(bgr, f"SOURCE {args.start + clip_time:.2f}s | shot {shot}",
                        (15, 28), cv2.FONT_HERSHEY_SIMPLEX, .7, (255, 255, 255), 2)
            if writer is None:
                writer = cv2.VideoWriter(str(output / 'annotated.mp4'),
                    cv2.VideoWriter_fourcc(*'mp4v'), args.fps, (width, height))
                if not writer.isOpened():
                    raise ValueError('Annotated video writer unavailable.')
            writer.write(bgr)
            if index % max(1, int(args.fps / 5)) == 0:
                cv2.imwrite(str(output / f'frame-{clip_time:.3f}.jpg'), bgr)
            if args.device == 'mps':
                peak_allocated = max(peak_allocated, torch.mps.current_allocated_memory())
                peak_driver = max(peak_driver, torch.mps.driver_allocated_memory())
            if index % 25 == 0:
                print(json.dumps({'frame': index, 'seconds': clip_time,
                                  'balls': sum(r['classId'] == 37 for r in raw_rows)}), flush=True)
    finally:
        if writer is not None:
            writer.release()
    if not frames:
        raise ValueError('No frames decoded within requested interval.')
    if args.device == 'cuda':
        torch.cuda.synchronize()
        hardware.update({'cudaMaxAllocatedBytes': torch.cuda.max_memory_allocated(),
                         'cudaMaxReservedBytes': torch.cuda.max_memory_reserved()})
    elapsed = time.monotonic() - loaded
    meta = {'model': f'RF-DETR {args.model}', 'weights': weights.name, 'weightsSha256': sha256(weights),
            'device': args.device, 'platform': platform.platform(), 'hardware': hardware, 'samplingFps': args.fps,
            'threshold': args.threshold, 'width': width, 'height': height, 'frameCount': len(frames),
            'ballView': args.ball_view, 'ballViewWindows': source_windows(width, height, args.ball_view),
            'inferenceCallsPerFrame': 1 if args.ball_view == 'full' else 1 + len(source_windows(width, height, args.ball_view)),
            'modelLoadSeconds': loaded - started, 'processingSeconds': elapsed,
            'processingScope': 'decode, inference, tracking, video/JPEG writes; excludes downloads/source hashing',
            'sampledMpsAllocatedBytesPeak': peak_allocated, 'sampledMpsDriverBytesPeak': peak_driver,
            'packages': {name: importlib.metadata.version(name) for name in
                         ('rfdetr', 'trackers', 'supervision', 'torch', 'torchvision', 'av', 'numpy')},
            'cutPolicy': 'HSV histogram Bhattacharyya distance > .55; heuristic cut candidates, not verified edits',
            'trackingPolicy': 'separate ByteTrack instances per class; observed boxes only; no interpolation',
            'videoTiming': 'annotated preview assumes constant sampled FPS; JSON source PTS is authoritative'}
    result = {'source': source, 'metadata': meta, 'frames': frames}
    (output / 'tracking.json').write_text(json.dumps(result, indent=2, allow_nan=False) + '\n')
    (output / 'evidence.json').write_text(json.dumps(compact_evidence(result), indent=2, allow_nan=False) + '\n')
    (output / 'summary.json').write_text(json.dumps({**meta,
        'ballDetectionFrames': sum(any(d['classId'] == 37 for d in f['detections']) for f in frames),
        'ballConfirmedTrackFrames': sum(any(d['classId'] == 37 and d['trackId'] for d in f['detections']) for f in frames),
        'cutCandidates': [f['recordingSeconds'] for f in frames if f['cutCandidate']]}, indent=2) + '\n')
    print(output / 'summary.json', flush=True)
    return output


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--video', type=Path, required=True)
    parser.add_argument('--source-id', default='barca-2018-full')
    parser.add_argument('--start', type=float, default=808)
    parser.add_argument('--duration', type=float, default=20)
    parser.add_argument('--model', choices=('small', 'medium'), default='small')
    parser.add_argument('--ball-view', choices=('full', 'crop', 'tiles'), default='full')
    parser.add_argument('--device', choices=('mps', 'cuda', 'cpu'), default='cpu')
    parser.add_argument('--fps', type=float, default=25)
    parser.add_argument('--threshold', type=float, default=.1)
    parser.add_argument('--download-weights', action='store_true')
    run(parser.parse_args())
