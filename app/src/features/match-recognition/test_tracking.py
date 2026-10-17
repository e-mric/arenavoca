"""Evidence/timebase contracts; fixture tests do not measure model accuracy."""
from pathlib import Path
import tempfile
import types
import unittest

import track


class TrackingTests(unittest.TestCase):
    def test_cuda_request_fails_before_model_loading_when_gpu_is_unavailable(self):
        try:
            import torch
            import rfdetr
        except ImportError:
            self.skipTest('Optional detector dependencies require the isolated environment')
        from unittest.mock import patch
        args = types.SimpleNamespace(start=808, duration=20, fps=25, threshold=.1, device='cuda')
        with patch.object(torch.cuda, 'is_available', return_value=False), \
                patch.object(rfdetr, 'RFDETRSmall') as load_model:
            with self.assertRaisesRegex(ValueError, 'no CPU fallback'):
                track.run(args)
            load_model.assert_not_called()

    def test_reused_control_rejects_changed_prompt_or_model(self):
        import hashlib
        import json
        from compare_tracking import verify_saved_control
        request = {'images': ['original'], 'seed': 42}
        previous = {'arms': {'baseline': {'requestSha256': hashlib.sha256(
            json.dumps(request, sort_keys=True).encode()).hexdigest()}}, 'model': {'digest': 'same'}}
        verify_saved_control(request, {'digest': 'same'}, previous)
        with self.assertRaises(ValueError): verify_saved_control({**request, 'seed': 1}, {'digest': 'same'}, previous)
        with self.assertRaises(ValueError): verify_saved_control(request, {'digest': 'different'}, previous)

    def test_point_audit_counts_duplicate_detections_once_and_keeps_missing_evidence(self):
        from audit_ball_views import audit_points
        ball = {'classId': 37, 'xyxy': [10, 10, 20, 20], 'confidence': .7, 'trackId': 'shot:ball:1'}
        data = {'source': {'recordingSha256': 'fixture'},
                'metadata': {'samplingFps': 25, 'width': 32, 'height': 32}, 'frames': [
            {'recordingSeconds': 814.4, 'detections': [ball, dict(ball)]},
            {'recordingSeconds': 814.6, 'detections': []}]}
        reference = {'reviewer': 'synthetic fixture', 'recordingSha256': 'fixture', 'imageSize': [32, 32], 'points': [
            {'recordingSeconds': 814.4, 'xy': [15, 15]},
            {'recordingSeconds': 814.6, 'xy': [25, 30]}]}
        result = audit_points(data, reference)
        self.assertEqual(result['matchedPoints'], 1)
        self.assertEqual(result['auditPoints'], 2)
        self.assertIsNone(result['points'][1]['bestConfidence'])
        reference['points'][1]['recordingSeconds'] = 815
        with self.assertRaises(ValueError): audit_points(data, reference)

    def test_ball_windows_cover_tiles_and_restore_source_coordinates(self):
        from ball_views import source_windows, restore_boxes
        self.assertEqual(source_windows(1280, 720, 'crop'), [(320, 180, 960, 540)])
        windows = source_windows(1280, 720, 'tiles')
        self.assertEqual(windows, [(0, 0, 768, 432), (512, 0, 1280, 432),
                                   (0, 288, 768, 720), (512, 288, 1280, 720)])
        for x, y in ((0, 0), (1279, 719), (640, 360), (510, 430)):
            self.assertTrue(any(a <= x < c and b <= y < d for a, b, c, d in windows))
        self.assertEqual(restore_boxes([[10, 20, 18, 28]], windows[-1]), [[522, 308, 530, 316]])
        self.assertEqual(restore_boxes([], windows[0]), [])
        with self.assertRaises(ValueError): source_windows(0, 720, 'tiles')
        with self.assertRaises(ValueError): restore_boxes([[1, 2, float('nan'), 4]], windows[0])

    def test_ball_view_merges_overlap_duplicates_but_keeps_people_in_source_space(self):
        try:
            import numpy as np
            import supervision as sv
        except ImportError:
            self.skipTest('Tracking dependencies require the isolated environment')
        from ball_views import detect_ball_views
        class Detector:
            calls = 0
            def predict(self, image, **_):
                self.calls += 1
                if self.calls == 1:
                    return sv.Detections(xyxy=np.array([[5, 6, 15, 26]]),
                        class_id=np.array([1]), confidence=np.array([.9]),
                        data={'class_name': np.array(['person'])})
                offsets = ((0, 0), (512, 0), (0, 288), (512, 288))
                x, y = offsets[self.calls - 2]
                # Same global ball is observed in all overlapping crops.
                return sv.Detections(xyxy=np.array([[600-x, 350-y, 610-x, 360-y]]),
                    class_id=np.array([37]), confidence=np.array([.8]))
        model = Detector()
        result = detect_ball_views(model, np.zeros((720, 1280, 3), dtype=np.uint8), .1, 'tiles')
        self.assertEqual(model.calls, 5)
        self.assertEqual(len(result), 2)
        self.assertEqual(result.xyxy[result.class_id == 37].tolist(), [[600, 350, 610, 360]])
        self.assertEqual(result.xyxy[result.class_id == 1].tolist(), [[5, 6, 15, 26]])

    def test_assisted_request_rejects_wrong_recording_and_preserves_baseline(self):
        from compare_tracking import add_tracking
        request = {'messages': [{'role': 'system', 'content': 'Original prompt.'},
                                {'role': 'user', 'content': 'Original images.'}], 'options': {'seed': 42}}
        source = {'recordingSha256': 'abc', 'clipSha256': 'clip', 'startSeconds': 808, 'durationSeconds': 2}
        data = {'source': dict(source), 'metadata': {'height': 720}, 'frames': [
            {'clipSeconds': 0, 'recordingSeconds': 808, 'shot': 0, 'detections': []}]}
        amended = add_tracking(request, source, data)
        self.assertEqual(request['messages'][0]['content'], 'Original prompt.')
        self.assertEqual(amended['options'], request['options'])
        self.assertIn('missing evidence', amended['messages'][1]['content'])
        self.assertNotIn('Alba', str(amended))
        data['source']['startSeconds'] = 809
        with self.assertRaises(ValueError):
            add_tracking(request, source, data)

    def test_source_time_conversion_preserves_subsampled_time_and_rejects_invalid(self):
        self.assertEqual(track.recording_seconds(5.4, 808), 813.4)
        for value in (-1, float('nan'), float('inf'), True):
            with self.subTest(value=value), self.assertRaises(ValueError):
                track.recording_seconds(value, 808)

    def test_empty_detections_stay_empty_and_unconfirmed_ids_are_not_identities(self):
        empty = types.SimpleNamespace(xyxy=[], class_id=[], confidence=[], tracker_id=None)
        self.assertEqual(track.detection_rows(empty, 1280, 720, 0), [])
        ball = types.SimpleNamespace(xyxy=[[100, 100, 110, 110]], class_id=[37],
                                     confidence=[.5], tracker_id=[-1])
        self.assertIsNone(track.detection_rows(ball, 1280, 720, 0)[0]['trackId'])
        ball.tracker_id = [1]
        self.assertNotEqual(track.detection_rows(ball, 1280, 720, 0)[0]['trackId'],
                            track.detection_rows(ball, 1280, 720, 1)[0]['trackId'])

    def test_compact_evidence_preserves_gaps_and_does_not_infer_actions(self):
        data = {'source': {'recordingSha256': 'abc', 'startSeconds': 808, 'durationSeconds': 2},
                'metadata': {'height': 720}, 'frames': [
                    {'clipSeconds': 0, 'shot': 0, 'detections': []},
                    {'clipSeconds': 1, 'shot': 1, 'detections': [{
                        'classId': 37, 'confidence': .2, 'trackId': None,
                        'centerNormalized': [.3, .4], 'xyxy': [1, 2, 3, 4]}]}]}
        evidence = track.compact_evidence(data)
        self.assertEqual(evidence['samples'][0]['ballCandidates'], [])
        self.assertIsNone(evidence['samples'][1]['ballCandidates'][0]['trackId'])
        self.assertEqual(evidence['samples'][1]['seconds'], 1)
        self.assertNotIn('action', evidence)

    def test_decoder_preserves_pts_when_skipping_frames(self):
        # Actual encoded fixture: capture clock must not be renumbered after subsampling.
        import subprocess
        try:
            import av
        except ImportError:
            self.skipTest('PyAV requires the isolated tracking environment')
        with tempfile.TemporaryDirectory() as folder:
            video = Path(folder) / 'clock.mp4'
            subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i',
                            'color=c=green:s=64x64:r=25:d=3', '-c:v', 'libx264', str(video)], check=True)
            times = [seconds for seconds, _ in track.sampled_frames(video, 1, 2, 5)]
            self.assertEqual(len(times), 10)
            for observed, expected in zip(times, (i / 5 for i in range(10))):
                self.assertAlmostEqual(observed, expected)
            with self.assertRaises(ValueError):
                list(track.sampled_frames(video, 2, 2, 5))


if __name__ == '__main__':
    unittest.main()
