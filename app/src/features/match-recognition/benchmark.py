"""Prepare a full-recording evaluation manifest locally; never run inference.

No clips, frames, transcripts, model calls or credentials are needed. Each run
creates a new private directory so an existing human review cannot be replaced.
"""
import argparse
import csv
from decimal import Decimal, InvalidOperation, ROUND_CEILING
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

from recognize import ACTIONS, OUTPUT_ROOT, probe, sha256


def seconds(value):
    try:
        result = Decimal(str(value))
    except InvalidOperation:
        raise ValueError('Times must be finite numbers.') from None
    if not result.is_finite():
        raise ValueError('Times must be finite numbers.')
    return result


def plan_windows(duration, window=20, step=16):
    duration, window, step = map(seconds, (duration, window, step))
    if duration <= 0 or not 2 <= window <= 30 or not 1 <= step <= window:
        raise ValueError('Use positive duration, 2–30 second windows and a 1–window second step.')
    count = int((duration / step).to_integral_value(rounding=ROUND_CEILING))
    if count > 100_000:
        raise ValueError('Recording exceeds the 100,000-window planning limit.')
    windows = []
    for index in range(count):
        start = index * step
        end = min(start + window, duration)
        eligible = end - start >= 2
        windows.append({
            'id': f'window-{index:06d}',
            'startSeconds': float(start), 'endSeconds': float(end),
            'durationSeconds': float(end - start),
            'evidenceWatermarkSeconds': float(end),
            'partial': end - start < window,
            'plannedStatus': 'pending' if eligible else 'skip-too-short',
            'reason': '' if eligible else 'Below the current two-second provider minimum.',
        })
    return windows


def make_manifest(source, sport, window=20, step=16):
    if sport not in ACTIONS:
        raise ValueError('Unsupported sport.')
    windows = plan_windows(source['durationSeconds'], window, step)
    policy = {'windowSeconds': float(seconds(window)),
              'stepSeconds': float(seconds(step)), 'minimumSeconds': 2,
              'shortTailPolicy': 'retain-and-skip',
              'timebase': 'recording-seconds', 'sport': sport}
    identity = {'source': source, 'policy': policy, 'version': 1}
    plan_id = hashlib.sha256(json.dumps(identity, sort_keys=True).encode('utf-8')).hexdigest()
    return {
        **identity, 'planId': plan_id, 'mode': 'dry-run',
        'windowCount': len(windows),
        'plannedRequestCount': sum(w['plannedStatus'] == 'pending' for w in windows),
        'inferenceRequestsMade': 0, 'reviewStatus': 'unreviewed',
        'inferenceConfiguration': None,
        'windows': windows,
        'limitations': [
            'A plan is not a benchmark result or evidence of recognition quality.',
            'Model, prompt, sampling and transcription must be frozen before execution.',
            'planId identifies the schedule, not an inference cache key.',
            'Overlapping window durations must not be summed as unique recording coverage.',
            'Reference annotations and review answers must never enter model prompts.',
        ],
    }


def write_plan(manifest, root):
    root.mkdir(parents=True, exist_ok=True)
    output = Path(tempfile.mkdtemp(prefix='plan-', dir=root))
    (output / 'manifest.json').write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False, allow_nan=False) + '\n',
        encoding='utf-8')
    fields = ['windowId', 'startSeconds', 'endSeconds', 'plannedStatus',
              'reviewStatus', 'referenceActions', 'correctProposedEvents',
              'falseProposedEvents', 'missedReferenceEvents', 'duplicateEvents',
              'timestampErrorSeconds', 'spanishReview', 'storyGroundingReview',
              'reviewer', 'notes']
    with (output / 'review.csv').open('w', newline='', encoding='utf-8') as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        for window in manifest['windows']:
            writer.writerow({'windowId': window['id'],
                             'startSeconds': window['startSeconds'],
                             'endSeconds': window['endSeconds'],
                             'plannedStatus': window['plannedStatus'],
                             'reviewStatus': 'unreviewed'})
    return output


def prepare_plan(video, source_id, sport='football', window=20, step=16,
                 root=OUTPUT_ROOT / 'benchmarks'):
    if not source_id.strip():
        raise ValueError('A source ID is required.')
    if not video.is_file():
        raise ValueError('Recording file does not exist.')
    before = video.stat()
    metadata = probe(video)
    if not any(s.get('codec_type') == 'video' for s in metadata.get('streams', [])):
        raise ValueError('Source must contain a video stream.')
    duration = metadata.get('format', {}).get('duration')
    # Validate scheduling before hashing a potentially large recording.
    plan_windows(duration, window, step)
    source = {'id': source_id, 'fileName': video.name,
              'recordingSha256': sha256(video),
              'durationSeconds': float(seconds(duration)),
              'hasAudio': any(s.get('codec_type') == 'audio' for s in metadata['streams'])}
    after = video.stat()
    if (before.st_size, before.st_mtime_ns) != (after.st_size, after.st_mtime_ns):
        raise ValueError('Recording changed during planning; retry with a stable file.')
    return write_plan(make_manifest(source, sport, window, step), root)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--video', required=True, type=Path)
    parser.add_argument('--source-id', required=True)
    parser.add_argument('--sport', choices=sorted(ACTIONS), default='football')
    parser.add_argument('--window', default='20')
    parser.add_argument('--step', default='16')
    args = parser.parse_args()
    try:
        output = prepare_plan(args.video, args.source_id, args.sport, args.window, args.step)
    except subprocess.CalledProcessError:
        parser.exit(1, 'Planning failed: ffprobe could not inspect the recording.\n')
    except (ValueError, OSError) as error:
        parser.exit(1, f'Planning failed: {error}\n')
    print(f'Prepared local dry run: {output}')
    print('No inference, upload or media extraction performed.')


if __name__ == '__main__':
    main()
