"""Fixture and loopback HTTP tests; no downloaded models or accuracy claims."""
import copy
import io
import json
from pathlib import Path
import tempfile
import threading
import types
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from unittest.mock import patch

import local_model as local
import recognize
from test_recognize import result, SOURCE

MODEL = 'qwen3-vl:8b'


def response(payload=None):
    return {'model': MODEL, 'done': True, 'done_reason': 'stop',
            'message': {'role': 'assistant', 'content': json.dumps(payload if payload is not None else result())},
            'prompt_eval_count': 100, 'eval_count': 30}


class LocalTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.output = Path(self.temp.name)
        self.source = {**SOURCE, 'hasAudio': True}
        self.frames = []
        for i in range(2):
            path = self.output / f'{i}.jpg'
            path.write_bytes(b'synthetic image ' + bytes([i]))
            self.frames.append({'file': path.name, 'seconds': i * 10, 'sha256': local.sha256(path)})

    def tearDown(self):
        self.temp.cleanup()

    def test_ordered_frames_and_bounded_transcript_without_known_answer(self):
        transcript = [{'start': 1, 'end': 2, 'text': 'A pass.'}]
        request = local.build_request(self.frames, self.output, self.source, 'football', MODEL, transcript)
        evidence = json.loads(request['messages'][1]['content'])
        self.assertEqual(evidence['sampleTimesSeconds'], [0, 10])
        self.assertEqual(evidence['transcript'], transcript)
        self.assertEqual(len(request['messages'][1]['images']), 2)
        self.assertNotIn('Alba', json.dumps(request))
        self.assertNotIn('tools', request)
        self.assertFalse(request['stream'])
        self.assertIn('do not hear audio', request['messages'][0]['content'])
        self.assertEqual(request['format'], recognize.schema('football'))

    def test_invalid_frame_counts_times_and_changed_bytes_fail_closed(self):
        for duration, fps in [(20, 4), (20, float('nan')), (31, 1), (2, .5)]:
            with self.subTest(duration=duration, fps=fps), self.assertRaises(ValueError):
                local.sample_times(duration, fps)
        self.assertEqual(local.sample_times(2, 1), [0, 1])
        for position in (-1, 0, 20, float('nan')):
            frames = copy.deepcopy(self.frames); frames[1]['seconds'] = position
            with self.subTest(position=position), self.assertRaises(ValueError):
                local.build_request(frames, self.output, self.source, 'football', MODEL, [])
        (self.output / '0.jpg').write_bytes(b'changed')
        with self.assertRaises(ValueError):
            local.build_request(self.frames, self.output, self.source, 'football', MODEL, [])

    def test_transcript_rejects_future_negative_unordered_and_oversize_evidence(self):
        for rows in ([{'start': 0, 'end': 21, 'text': 'future'}],
                     [{'start': -1, 'end': 1, 'text': 'past'}],
                     [{'start': 2, 'end': 3, 'text': 'one'}, {'start': 0, 'end': 1, 'text': 'two'}],
                     [{'start': 0, 'end': 1, 'text': 'x' * 12001}],
                     [{'start': True, 'end': 1, 'text': 'bad'}]):
            with self.subTest(rows=str(rows)[:70]), self.assertRaises(ValueError):
                local.validate_transcript(rows, 20)

    def test_shared_contract_offsets_once_and_withholds_replays(self):
        draft = local.parse_result(response(), self.source, 'football')
        self.assertEqual(draft['observations'][0]['recordingStartSeconds'], 814)
        data = result(); data['events'][0]['footage'] = 'replay'
        draft = local.parse_result(response(data), self.source, 'football')
        self.assertEqual(draft['cards'], [])
        self.assertEqual(draft['story'], [])
        empty = local.parse_result(response({'events': [], 'story': []}), self.source, 'football', False)
        self.assertEqual(empty['cards'], [])

    def test_rejects_bad_json_truncation_remote_output_and_invented_commentary(self):
        bad = response(); bad['message']['content'] = 'not JSON'
        variants = [bad, {**response(), 'done': False}, {**response(), 'done_reason': 'length'},
                    {**response(), 'remote_host': 'https://example.com'}]
        bad = response(); bad['message']['tool_calls'] = [{'name': 'search'}]; variants.append(bad)
        data = result(); data['events'][0]['endSeconds'] = 21; variants.append(response(data))
        for raw in variants:
            with self.assertRaises(ValueError): local.parse_result(raw, self.source, 'football')
        with self.assertRaises(ValueError):
            local.parse_result(response(), self.source, 'football', has_transcript=False)

    def test_whisper_requires_complete_local_files_and_uses_cpu_without_download(self):
        with self.assertRaises(ValueError): local.transcribe(self.output / 'clip.mp4', 20, self.output)
        for name in ('model.bin', 'config.json', 'tokenizer.json'):
            (self.output / name).write_bytes(b'local fixture')
        mock_model = unittest.mock.Mock()
        mock_model.transcribe.return_value = (iter([types.SimpleNamespace(start=1, end=2, text=' A pass. ')]),
                                              types.SimpleNamespace(language='en'))
        factory = unittest.mock.Mock(return_value=mock_model)
        module = types.SimpleNamespace(WhisperModel=factory)
        with patch.dict('sys.modules', {'faster_whisper': module}), \
             patch('importlib.metadata.version', return_value='test-version'):
            rows, meta = local.transcribe(self.output / 'clip.mp4', 20, self.output)
        factory.assert_called_once_with(str(self.output.resolve()), device='cpu', compute_type='int8', local_files_only=True)
        self.assertEqual(rows[0]['text'], 'A pass.')
        self.assertEqual(meta['language'], 'en')
        self.assertIn('tokenizer.json', meta['modelFiles'])

    def test_cli_local_preparation_never_reads_credentials_or_calls_any_model(self):
        clip = self.output / 'clip.mp4'; clip.write_bytes(b'video')
        with patch.object(recognize, 'OUTPUT_ROOT', self.output), \
             patch.object(recognize, 'prepare', return_value=(clip, self.source)), \
             patch.object(local, 'prepare_frames', return_value=self.frames), \
             patch.object(local, 'analyze_local', side_effect=AssertionError('Inference forbidden')), \
             patch.object(recognize, 'api_key', side_effect=AssertionError('Credentials forbidden')), \
             patch.object(recognize, 'cloud_token', side_effect=AssertionError('Cloud forbidden')), \
             patch('sys.stdout', new_callable=io.StringIO):
            recognize.main(['--video', str(clip), '--source-id', 'test', '--start', '808',
                            '--provider', 'ollama', '--visual-only'])

    def test_cli_cloud_default_is_preserved(self):
        clip = self.output / 'clip.mp4'; clip.write_bytes(b'video')
        with patch.object(recognize, 'OUTPUT_ROOT', self.output), \
             patch.object(recognize, 'prepare', return_value=(clip, self.source)), \
             patch.object(recognize, 'api_key', return_value='fixture-only'), \
             patch.object(recognize, 'analyze', return_value={'observations': [], 'cards': []}) as call, \
             patch.object(local, 'analyze_local', side_effect=AssertionError('Unexpected local route')), \
             patch('sys.stdout', new_callable=io.StringIO):
            recognize.main(['--video', str(clip), '--source-id', 'test', '--start', '808', '--analyze'])
        self.assertEqual(call.call_args.args[3], 'gemini-3.8-flash')
        call.assert_called_once()

    def test_cli_local_analysis_routes_without_cloud_fallback(self):
        clip = self.output / 'clip.mp4'; clip.write_bytes(b'video')
        with patch.object(recognize, 'OUTPUT_ROOT', self.output), \
             patch.object(recognize, 'prepare', return_value=(clip, self.source)), \
             patch.object(local, 'prepare_frames', return_value=self.frames), \
             patch.object(local, 'analyze_local', side_effect=ValueError('Ollama unavailable')) as call, \
             patch.object(recognize, 'analyze', side_effect=AssertionError('Cloud forbidden')), \
             patch.object(recognize, 'api_key', side_effect=AssertionError('Credentials forbidden')), \
             patch.object(recognize, 'cloud_token', side_effect=AssertionError('Cloud forbidden')), \
             patch('sys.stdout', new_callable=io.StringIO), patch('sys.stderr', new_callable=io.StringIO):
            with self.assertRaises(SystemExit):
                recognize.main(['--video', str(clip), '--source-id', 'test', '--start', '808',
                                '--provider', 'ollama', '--visual-only', '--analyze'])
        call.assert_called_once()


class LocalHttpTests(unittest.TestCase):
    # Reuse temporary evidence helpers; HTTP cases exercise the real client.
    def setUp(self):
        LocalTests.setUp(self)
        self.calls = []
        self.raw = response({'events': [], 'story': []})
        self.remote = False
        owner = self
        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *_): pass
            def do_GET(self): self.handle_request()
            def do_POST(self): self.handle_request()
            def handle_request(self):
                payload = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))) or b'{}')
                owner.calls.append((self.path, payload))
                if self.path == '/api/tags':
                    body = {'models': [{'name': MODEL, 'digest': 'fixture-digest', 'size': 1}]}
                elif self.path == '/api/show':
                    body = {'capabilities': ['vision'], 'remote_host': 'https://remote.invalid' if owner.remote else ''}
                elif self.path == '/api/version': body = {'version': 'fixture-server'}
                elif self.path == '/api/ps': body = {'models': []}
                else: body = owner.raw
                encoded = json.dumps(body).encode()
                self.send_response(200); self.send_header('Content-Length', str(len(encoded)))
                self.end_headers(); self.wfile.write(encoded)
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.client = local.OllamaClient(port=self.server.server_port)

    def tearDown(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join()
        LocalTests.tearDown(self)

    def test_real_http_adapter_records_draft_metadata_and_one_request(self):
        draft = local.analyze_local(self.output / 'unused.mp4', self.source, 'football', MODEL,
                                    self.output, client=self.client, frames=self.frames)
        self.assertEqual(draft['cards'], [])
        self.assertEqual(draft['analysis']['digest'], 'fixture-digest')
        self.assertEqual(draft['analysis']['usage']['eval_count'], 30)
        self.assertEqual(sum(path == '/api/chat' for path, _ in self.calls), 1)
        self.assertEqual(json.loads((self.output / 'analysis.json').read_text())['status'], 'needs-review')
        self.assertTrue((self.output / 'raw-response.json').is_file())

    def test_transcript_path_delivers_commentary_to_the_same_contract(self):
        self.raw = response()
        transcript = [{'start': 6, 'end': 9, 'text': 'A backward pass.'}]
        with patch.object(local, 'transcribe', return_value=(transcript, {'provider': 'fixture'})):
            draft = local.analyze_local(self.output / 'clip.mp4', self.source, 'football', MODEL,
                                        self.output, client=self.client, frames=self.frames,
                                        whisper_model=self.output)
        self.assertEqual(draft['cards'][0]['spanish'], 'El jugador pasa hacia atrás.')
        sent = next(payload for path, payload in self.calls if path == '/api/chat')
        self.assertEqual(json.loads(sent['messages'][1]['content'])['transcript'], transcript)

    def test_missing_audio_does_not_silently_fall_back(self):
        self.source['hasAudio'] = False
        with self.assertRaisesRegex(ValueError, 'No audio stream'):
            local.analyze_local(self.output / 'clip.mp4', self.source, 'football', MODEL,
                                self.output, client=self.client, frames=self.frames,
                                whisper_model=self.output)
        self.assertNotIn('/api/chat', [path for path, _ in self.calls])

    def test_previous_analysis_is_preserved(self):
        (self.output / 'draft.json').write_text('reviewed result')
        with self.assertRaisesRegex(ValueError, 'fresh output'):
            local.analyze_local(self.output / 'clip.mp4', self.source, 'football', MODEL,
                                self.output, client=self.client, frames=self.frames)
        self.assertEqual(self.calls, [])
        self.assertEqual((self.output / 'draft.json').read_text(), 'reviewed result')

    def test_missing_model_requires_explicit_install(self):
        with patch.object(self.client, 'request', return_value={'models': []}) as call:
            with self.assertRaisesRegex(ValueError, 'not installed locally'):
                self.client.preflight(MODEL)
        call.assert_called_once_with('/api/tags')

    def test_remote_alias_rejected_before_sending_images(self):
        self.remote = True
        with self.assertRaises(ValueError): self.client.preflight(MODEL)
        self.assertNotIn('/api/chat', [path for path, _ in self.calls])
        with self.assertRaises(ValueError): self.client.preflight('qwen3-vl:8b-cloud')

    def test_invalid_output_is_preserved_but_not_published_as_draft(self):
        self.raw = response(); self.raw['message']['content'] = '{invalid'
        with self.assertRaises(ValueError):
            local.analyze_local(self.output / 'unused.mp4', self.source, 'football', MODEL,
                                self.output, client=self.client, frames=self.frames)
        self.assertFalse((self.output / 'draft.json').exists())
        self.assertEqual(json.loads((self.output / 'raw-response.json').read_text()), self.raw)
        self.assertEqual(json.loads((self.output / 'analysis.json').read_text())['status'], 'failed')

    def test_timeout_has_no_retry(self):
        with patch.object(self.client.opener, 'open', side_effect=TimeoutError) as call:
            with self.assertRaisesRegex(ValueError, 'No retry or cloud fallback'):
                self.client.request('/api/chat', {})
        call.assert_called_once()

    def test_redirect_handler_blocks_external_destinations(self):
        with self.assertRaises(ValueError):
            local.NoRedirect().redirect_request(None, None, 302, 'Found', {}, 'https://example.com')


if __name__ == '__main__': unittest.main()
