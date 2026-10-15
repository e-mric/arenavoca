"""Schedule and privacy checks; none measures model recognition quality."""
import csv
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import benchmark as b


class BenchmarkTests(unittest.TestCase):
    def test_full_recording_has_complete_bounded_coverage(self):
        windows = b.plan_windows('5960.794558')
        self.assertEqual(len(windows), 373)
        self.assertEqual(windows[0]['startSeconds'], 0)
        self.assertEqual(windows[-1]['startSeconds'], 5952)
        self.assertEqual(windows[-1]['endSeconds'], 5960.794558)
        self.assertEqual(windows[-1]['durationSeconds'], 8.794558)
        for previous, window in zip(windows, windows[1:]):
            self.assertLessEqual(window['startSeconds'], previous['endSeconds'])
            self.assertLessEqual(window['endSeconds'], 5960.794558)
            self.assertEqual(window['evidenceWatermarkSeconds'], window['endSeconds'])

    def test_short_tail_is_explicit_and_does_not_count_as_request(self):
        manifest = b.make_manifest({'durationSeconds': 32.5}, 'football')
        self.assertEqual(manifest['windowCount'], 3)
        self.assertEqual(manifest['plannedRequestCount'], 2)
        self.assertEqual(manifest['windows'][-1]['plannedStatus'], 'skip-too-short')
        self.assertTrue(manifest['windows'][-1]['reason'])
        self.assertEqual(b.plan_windows(1)[0]['plannedStatus'], 'skip-too-short')

    def test_exact_boundary_has_no_zero_length_window(self):
        self.assertEqual([w['startSeconds'] for w in b.plan_windows(32)], [0, 16])
        self.assertEqual(len(b.plan_windows(30, 10, 10)), 3)
        self.assertEqual(b.plan_windows(34)[-1]['plannedStatus'], 'pending')

    def test_rejects_invalid_or_unbounded_plans(self):
        for args in [(0,), (-1,), ('nan',), ('inf',), (None,),
                     (30, 31, 16), (30, 1, 1), (30, 20, 21),
                     (30, 20, 0), (30, 20, 'nan'), (100_001, 2, 1)]:
            with self.subTest(args=args), self.assertRaises(ValueError):
                b.plan_windows(*args)

    def test_identity_is_portable_but_not_an_inference_cache_key(self):
        source = {'durationSeconds': 40, 'recordingSha256': 'a' * 64}
        first = b.make_manifest(source, 'football')
        self.assertEqual(first, b.make_manifest(source, 'football'))
        self.assertNotEqual(first['planId'], b.make_manifest(source, 'football', step=10)['planId'])
        self.assertNotEqual(first['planId'], b.make_manifest(source, 'f1')['planId'])
        self.assertEqual(first['inferenceRequestsMade'], 0)
        self.assertIsNone(first['inferenceConfiguration'])
        self.assertEqual(first['reviewStatus'], 'unreviewed')

    def test_exports_all_windows_and_preserves_previous_review(self):
        with tempfile.TemporaryDirectory() as folder:
            manifest = b.make_manifest({'durationSeconds': 32.5}, 'football')
            first = b.write_plan(manifest, Path(folder))
            with (first / 'review.csv').open(encoding='utf-8') as stream:
                rows = list(csv.DictReader(stream))
            self.assertEqual(len(rows), 3)
            self.assertEqual(rows[-1]['plannedStatus'], 'skip-too-short')
            self.assertTrue(all(r['reviewStatus'] == 'unreviewed' for r in rows))
            self.assertTrue(all(r['correctProposedEvents'] == '' for r in rows))
            (first / 'review.csv').write_text('Human review: español', encoding='utf-8')
            second = b.write_plan(manifest, Path(folder))
            self.assertNotEqual(first, second)
            self.assertEqual((first / 'review.csv').read_text(encoding='utf-8'), 'Human review: español')
            self.assertEqual(json.loads((second / 'manifest.json').read_text()), manifest)

    def test_preparation_reads_media_without_upload_or_extraction(self):
        with tempfile.TemporaryDirectory() as folder:
            video = Path(folder) / 'recording.mp4'
            video.write_bytes(b'synthetic video fixture')
            metadata = {'format': {'duration': '40'}, 'streams': [{'codec_type': 'video'}]}
            with patch.object(b, 'probe', return_value=metadata), \
                 patch('urllib.request.urlopen', side_effect=AssertionError('Network forbidden')), \
                 patch('subprocess.run', side_effect=AssertionError('Extraction forbidden')):
                output = b.prepare_plan(video, 'synthetic', root=Path(folder) / 'outputs')
            data = json.loads((output / 'manifest.json').read_text())
            self.assertFalse(data['source']['hasAudio'])
            self.assertEqual(data['source']['recordingSha256'], b.sha256(video))
            self.assertNotIn(str(video.parent), json.dumps(data))
            self.assertEqual(sorted(p.name for p in output.iterdir()), ['manifest.json', 'review.csv'])

    def test_rejects_audio_only_and_missing_recordings_before_writing(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'absent.mp4'
            with self.assertRaises(ValueError):
                b.prepare_plan(path, 'test')
            path.write_bytes(b'audio')
            with patch.object(b, 'probe', return_value={'streams': [{'codec_type': 'audio'}]}):
                with self.assertRaises(ValueError):
                    b.prepare_plan(path, 'test')


if __name__ == '__main__':
    unittest.main()
