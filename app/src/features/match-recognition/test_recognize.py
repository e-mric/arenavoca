"""Synthetic fixtures exercise boundaries; they are not model accuracy evidence."""
import copy
import io
import json
import tempfile
import unittest
import urllib.error
from pathlib import Path
from unittest.mock import patch
import recognize as r


SOURCE = {'kind': 'arena-video', 'id': 'synthetic', 'clipSha256': 'a' * 64,
          'startSeconds': 808, 'durationSeconds': 20}
EVENT = {'startSeconds': 6, 'endSeconds': 9, 'action': 'cutback',
         'footage': 'live-action', 'confidence': 'high',
         'visualEvidence': 'The ball travels backward from the byline to a teammate.',
         'commentaryEvidence': 'A backward pass is described.', 'uncertainty': '',
         'spanish': 'El jugador pasa hacia atrás.',
         'english': 'The player passes backward.'}


def result():
    return {'events': [copy.deepcopy(EVENT)], 'story': [
        {'eventIndex': 0, 'spanish': 'Primero, pasa hacia atrás.',
         'english': 'First, he passes backward.'}]}


def response(payload):
    return {'status': 'completed', 'steps': [{'type': 'model_output',
            'content': [{'type': 'text', 'text': json.dumps(payload)}]}]}


class RecognitionTests(unittest.TestCase):
    def test_recording_offset_once_and_no_mutation(self):
        original = result()
        draft = r.review_draft(original, SOURCE, 'football')
        self.assertEqual(draft['observations'][0]['recordingStartSeconds'], 814)
        self.assertEqual(draft['observations'][0]['recordingEndSeconds'], 817)
        self.assertEqual(original, result())
        self.assertEqual(draft['cards'][0]['status'], 'needs-review')
        self.assertEqual(draft['story'][0]['eventId'], draft['cards'][0]['eventId'])

    def test_replays_uncertainty_and_missing_evidence_do_not_become_cards(self):
        for field, value in [('footage', 'replay'), ('footage', 'unknown'),
                             ('confidence', 'medium'), ('confidence', 'low'),
                             ('visualEvidence', ' '), ('spanish', ''),
                             ('uncertainty', 'Ball is obscured'), ('action', 'other')]:
            with self.subTest(field=field, value=value):
                data = result(); data['events'][0][field] = value
                draft = r.review_draft(data, SOURCE, 'football')
                self.assertEqual(draft['cards'], [])
                self.assertEqual(draft['story'], [])
                self.assertEqual(draft['observations'][0]['status'], 'withheld')

    def test_rejects_out_of_clip_or_invalid_timestamps(self):
        for field, value in [('endSeconds', 21), ('startSeconds', 9),
                             ('startSeconds', -1), ('startSeconds', float('nan')),
                             ('endSeconds', float('inf')), ('startSeconds', True)]:
            with self.subTest(field=field, value=value):
                data = result(); data['events'][0][field] = value
                with self.assertRaises(ValueError): r.review_draft(data, SOURCE, 'football')

    def test_rejects_unordered_observations(self):
        data = result(); earlier = copy.deepcopy(EVENT)
        earlier.update(startSeconds=1, endSeconds=2)
        data['events'].append(earlier)
        with self.assertRaises(ValueError): r.review_draft(data, SOURCE, 'football')

    def test_rejects_invented_or_repeated_story_links(self):
        data = result(); data['story'][0]['eventIndex'] = 1
        with self.assertRaises(ValueError): r.review_draft(data, SOURCE, 'football')
        data = result(); data['story'] *= 2
        with self.assertRaises(ValueError): r.review_draft(data, SOURCE, 'football')

    def test_no_action_is_valid_and_sport_vocabularies_are_separate(self):
        self.assertEqual(r.review_draft({'events': [], 'story': []}, SOURCE, 'football')['cards'], [])
        with self.assertRaises(ValueError): r.review_draft(result(), SOURCE, 'f1')
        data = result(); data['events'][0]['action'] = 'overtake'
        self.assertEqual(len(r.review_draft(data, SOURCE, 'f1')['cards']), 1)

    def test_rejects_wrong_shape_long_text_extra_fields(self):
        for change in (lambda d: d.update(published=True),
                       lambda d: d['events'][0].update(visualEvidence='a' * 601),
                       lambda d: d['events'].append(None),
                       lambda d: d.update(events=[EVENT] * 9)):
            data = result(); change(data)
            with self.assertRaises(ValueError): r.review_draft(data, SOURCE, 'football')

    def test_clip_request_has_audio_video_no_answer_leak_no_tools(self):
        request = r.build_request(b'video-and-audio', 'football', 20, 'test-model')
        self.assertFalse(request['store'])
        self.assertNotIn('tools', request)
        self.assertEqual(request['input'][0]['processing']['fps'], 4)
        self.assertNotIn('Alba', request['input'][1]['text'])
        with self.assertRaises(ValueError): r.build_request(b'a' * 12_000_001, 'football', 20, 'test')

    def test_only_completed_model_output_is_parsed(self):
        valid = response(result())
        valid['steps'].insert(0, {'type': 'user_input', 'content': [{'type': 'text', 'text': 'bad'}]})
        self.assertEqual(r.parse_response(valid), result())
        for status in ['incomplete', 'failed', 'requires_action']:
            with self.assertRaises(ValueError): r.parse_response({**valid, 'status': status})
        with self.assertRaises(ValueError): r.parse_response({'status': 'completed', 'steps': []})

    def test_invalid_windows(self):
        for start, duration in [(-1, 20), (0, 31), (0, 0), (float('nan'), 20), (0, float('inf'))]:
            with self.assertRaises(ValueError): r.validate_window(start, duration)
        r.validate_window(808, 20)

    def test_client_success_keeps_key_out_of_report(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory); clip = output / 'excerpt.mp4'; clip.write_bytes(b'test')
            def opener(req, timeout):
                self.assertEqual(timeout, 90)
                self.assertEqual(req.get_header('X-goog-api-key'), 'private-test-key')
                return io.BytesIO(json.dumps(response(result())).encode())
            draft = r.analyze(clip, SOURCE, 'football', 'test-model', 'private-test-key', output, opener)
            self.assertEqual(draft['analysis']['model'], 'test-model')
            self.assertNotIn('private-test-key', (output / 'draft.json').read_text())

    def test_failed_request_has_no_output_no_retry_no_provider_error_body(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory); clip = output / 'excerpt.mp4'; clip.write_bytes(b'test')
            calls = []
            def fail(req, timeout):
                calls.append(req)
                raise urllib.error.HTTPError(r.ENDPOINT, 429, 'secret', {}, io.BytesIO(b'secret'))
            with self.assertRaisesRegex(ValueError, 'HTTP 429') as error:
                r.analyze(clip, SOURCE, 'football', 'test', 'key', output, fail)
            self.assertNotIn('secret', str(error.exception))
            self.assertEqual(len(calls), 1)
            self.assertFalse((output / 'draft.json').exists())
            with self.assertRaises(ValueError):
                r.analyze(clip, SOURCE, 'football', 'test', '', output, fail)
            self.assertEqual(len(calls), 1)

    def test_cloud_route_uses_project_and_bearer_without_api_key(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory); clip = output / 'excerpt.mp4'; clip.write_bytes(b'test')
            def opener(req, timeout):
                self.assertEqual(req.full_url, 'https://aiplatform.googleapis.com/v1beta1/projects/arenavoca/locations/global/interactions')
                self.assertEqual(req.get_header('Authorization'), 'Bearer private-token')
                self.assertEqual(req.get_header('X-goog-user-project'), 'arenavoca')
                self.assertIsNone(req.get_header('X-goog-api-key'))
                return io.BytesIO(json.dumps(response(result())).encode())
            draft = r.analyze(clip, SOURCE, 'football', 'test', 'private-token', output, opener, project='arenavoca')
            self.assertEqual(draft['analysis']['project'], 'arenavoca')
            self.assertNotIn('private-token', (output / 'draft.json').read_text())

    def test_cloud_project_cannot_redirect_credentials(self):
        for project in ['../evil', 'a/b', 'https://evil.example', '', 'arenavoca?key=oops']:
            with self.assertRaises(ValueError): r.cloud_endpoint(project)

    def test_cloud_login_failure_does_not_leak_subprocess_output(self):
        with patch.object(r.subprocess, 'check_output', side_effect=r.subprocess.CalledProcessError(1, ['gcloud'], output='private')):
            with self.assertRaisesRegex(ValueError, 'sign-in required') as error:
                r.cloud_token('arenavoca')
            self.assertNotIn('private', str(error.exception))

    def test_provider_error_accepts_list_envelope_without_echoing_secrets(self):
        body = [{'error': {'message': 'private-token', 'details': [{'reason': 'API_KEY_SERVICE_BLOCKED'}]}}]
        error = urllib.error.HTTPError(r.ENDPOINT, 403, 'secret', {}, io.BytesIO(json.dumps(body).encode()))
        message = str(r.provider_error(error))
        self.assertIn('key does not allow', message)
        self.assertNotIn('private-token', message)
        self.assertNotIn('secret', message)

    def test_prepare_rejects_window_after_recording_end_before_extracting(self):
        with patch.object(r, 'probe', return_value={'format': {'duration': '10'}}), patch.object(r.subprocess, 'run') as run:
            with self.assertRaises(ValueError): r.prepare(Path('video'), Path('out'), 9, 5, 'test')
            run.assert_not_called()


if __name__ == '__main__': unittest.main()
