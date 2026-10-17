"""Compare observed ball candidates against separate, explicitly labelled point audits."""
import argparse
import json
import math
from pathlib import Path


def audit_points(tracking, reference, tolerance=12):
    """One hit per reference point; extra/duplicate candidates never inflate coverage."""
    if (reference['recordingSha256'] != tracking['source']['recordingSha256'] or
            reference['imageSize'] != [tracking['metadata']['width'], tracking['metadata']['height']]):
        raise ValueError('Point audit source hash/image geometry does not match the tracking data.')
    results = []
    for point in reference['points']:
        row = min(tracking['frames'], key=lambda f: abs(f['recordingSeconds'] - point['recordingSeconds']))
        if abs(row['recordingSeconds'] - point['recordingSeconds']) > .5 / tracking['metadata']['samplingFps'] + 1e-6:
            raise ValueError('No aligned observed frame for audit point.')
        balls = [d for d in row['detections'] if d['classId'] == 37]
        matches = [d for d in balls if math.hypot(
            (d['xyxy'][0] + d['xyxy'][2]) / 2 - point['xy'][0],
            (d['xyxy'][1] + d['xyxy'][3]) / 2 - point['xy'][1]) <= tolerance]
        best = max(matches, key=lambda d: d['confidence']) if matches else None
        results.append({'recordingSeconds': point['recordingSeconds'], 'referenceXY': point['xy'],
                        'matched': bool(matches), 'candidateCount': len(balls),
                        'matchingCandidateCount': len(matches),
                        'bestConfidence': None if best is None else best['confidence'],
                        'bestTrackId': None if best is None else best['trackId']})
    return {'reviewer': reference['reviewer'], 'tolerancePixels': tolerance,
            'auditPoints': len(results), 'matchedPoints': sum(r['matched'] for r in results),
            'confirmedMatchingPoints': sum(r['bestTrackId'] is not None for r in results),
            'matchingPointsAtConfidence05': sum((r['bestConfidence'] or 0) >= .5 for r in results),
            'unmatchedCandidatesAtAuditFrames': sum(r['candidateCount'] - r['matchingCandidateCount'] for r in results),
            'points': results,
            'limitations': 'Audit subset only; reviewer provenance is explicit. Not full-clip precision/recall or action recognition.'}


def compare(paths, reference):
    compared, control = [], None
    for path in paths:
        tracking = json.loads(path.read_text())
        signature = ([tracking['source'].get(k) for k in
                      ('recordingSha256', 'startSeconds', 'durationSeconds')],
                     [tracking['metadata'][k] for k in ('weightsSha256', 'samplingFps', 'threshold')])
        if control is not None and signature != control:
            raise ValueError('Comparison runs must share recording/window, weights, sampling and threshold.')
        control = signature
        meta = tracking['metadata']
        compared.append({'path': str(path), 'view': meta.get('ballView', 'full'),
                         'processingSeconds': meta['processingSeconds'], 'device': meta['device'],
                         'frameCount': len(tracking['frames']), **audit_points(tracking, reference)})
    return compared


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--points', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('runs', type=Path, nargs='+')
    args = parser.parse_args()
    result = compare(args.runs, json.loads(args.points.read_text()))
    args.output.write_text(json.dumps(result, indent=2, allow_nan=False) + '\n')
    print(json.dumps([{k: v for k, v in row.items() if k != 'points'} for row in result], indent=2))
