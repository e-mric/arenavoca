import unittest
from serve import RunPolicy, Provider, parse_provider, produce
import json
import tempfile
from pathlib import Path
from unittest.mock import patch
import serve


class PolicyTests(unittest.TestCase):
    def setUp(self):
        self.now = 0
        self.policy = RunPolicy(lambda: self.now)
        self.token = self.policy.start(808)

    def window(self, start=808, end=828):
        return dict(sourceId='barca-2018-full', startSeconds=start, endSeconds=end)

    def test_future_and_unobserved_footage_rejected(self):
        with self.assertRaises(ValueError): self.policy.claim(self.token, self.window())
        self.now = 20
        with self.assertRaises(ValueError): self.policy.claim(self.token, self.window(807, 827))
        self.policy.claim(self.token, self.window())
        self.assertTrue(self.policy.finish(self.token))

    def test_one_inflight_and_no_duplicate_window(self):
        self.now = 40
        self.policy.claim(self.token, self.window())
        with self.assertRaises(ValueError): self.policy.claim(self.token, self.window(824, 844))
        self.policy.finish(self.token)
        with self.assertRaises(ValueError): self.policy.claim(self.token, self.window())

    def test_stop_invalidates_results_but_does_not_free_busy_slot_early(self):
        self.now = 20
        self.policy.claim(self.token, self.window())
        self.policy.stop(self.token)
        with self.assertRaises(ValueError): self.policy.start(850)
        self.assertFalse(self.policy.finish(self.token))
        self.policy.start(850)

    def test_session_and_process_caps(self):
        for run in range(2):
            if run: self.token = self.policy.start(808)
            created = self.now
            for index in range(3):
                self.now = created + 20 + index * 16
                self.policy.claim(self.token, self.window(808 + index * 16, 828 + index * 16))
                self.policy.finish(self.token)
            self.now += 20
            with self.assertRaises(ValueError): self.policy.claim(self.token, self.window(856, 876))
            self.policy.stop(self.token)
        with self.assertRaises(ValueError): self.policy.start(808)

    def test_bad_sources_tokens_and_expired_sessions(self):
        self.now = 20
        with self.assertRaises(ValueError): self.policy.claim('wrong', self.window())
        window = self.window(); window['sourceId'] = '../../private'
        with self.assertRaises(ValueError): self.policy.claim(self.token, window)
        self.now = 301
        with self.assertRaises(ValueError): self.policy.claim(self.token, self.window())
        self.policy.start(808)



# Real HTTP boundary checks use a fake inference function; never call a paid API.
class HttpTests(unittest.TestCase):
    def setUp(self):
        import threading
        from http.server import ThreadingHTTPServer
        from serve import handler
        self.now = 0
        self.policy = RunPolicy(lambda: self.now)
        self.provider = Provider(name='ollama', model='qwen3-vl:8b', project='')
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), handler(self.policy, self.provider, produce))
        self.thread = threading.Thread(target=lambda: self.server.serve_forever(poll_interval=.01), daemon=True)
        self.thread.start()
        import urllib.request
        with urllib.request.urlopen(f"http://127.0.0.1:{self.server.server_port}/api/recognition/configuration") as reply:
            self.config = json.load(reply)

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()

    def post(self, path, data, origin=True):
        import json
        import urllib.request
        host = '127.0.0.1:' + str(self.server.server_port)
        headers = {'Content-Type': 'application/json'}
        if origin: headers['Origin'] = 'http://' + host
        request = urllib.request.Request('http://' + host + '/api/recognition/' + path,
                                         data=json.dumps(data).encode(), headers=headers)
        return urllib.request.urlopen(request)

    def test_cross_origin_mutations_denied(self):
        from urllib.error import HTTPError
        with self.assertRaises(HTTPError) as error: self.post('start', {'position': 808, 'configuration': self.config['id']}, origin=False)
        self.assertEqual(error.exception.code, 403)
        self.assertIsNone(self.policy.session)

    def test_future_request_does_not_spend_model_budget(self):
        import json
        from urllib.error import HTTPError
        from unittest.mock import patch
        with patch('serve.VIDEO') as video:
            video.is_file.return_value = True
            with self.post('start', {'position': 808, 'configuration': self.config['id']}) as response:
                session = json.load(response)['session']
        with self.assertRaises(HTTPError):
            self.post('analyze', {'session': session, 'window': {'sourceId': 'barca-2018-full', 'startSeconds': 808, 'endSeconds': 828}})
        self.assertEqual(self.policy.total, 0)
        with self.post('stop', {'session': session}) as response: self.assertEqual(response.status, 200)
        self.assertIsNone(self.policy.session)


    def start(self):
        with patch('serve.VIDEO') as video:
            video.is_file.return_value = True
            with self.post('start', {'position': 808, 'configuration': self.config['id']}) as response:
                token = json.load(response)['session']
        self.now = 20
        return token

    def test_configuration_change_or_client_provider_override_cannot_start(self):
        from urllib.error import HTTPError
        self.assertEqual(self.config['provider'], 'ollama')
        self.assertEqual(self.config['evidence'], 'frames')
        self.assertNotIn('project', self.config)
        for data in ({'position': 808, 'configuration': 'stale'},
                     {'position': 808, 'configuration': self.config['id'], 'provider': 'gemini'}):
            with self.assertRaises(HTTPError): self.post('start', data)
        self.assertIsNone(self.policy.session)
        self.assertEqual(self.policy.total, 0)

    def test_local_adapter_to_http_cards_story_and_private_silent_replay(self):
        import local_model
        from test_recognize import result, SOURCE
        from test_local_model import response
        import urllib.request
        from unittest.mock import Mock
        from recognize import sha256
        token = self.start()
        data = result(); data['events'][0]['commentaryEvidence'] = ''
        client = Mock()
        client.preflight.return_value = {'model': 'qwen3-vl:8b', 'digest': 'fixture', 'ollamaVersion': 'fixture'}
        client.request.side_effect = lambda path, *args: response(data) if path == '/api/chat' else {'models': []}
        with tempfile.TemporaryDirectory() as directory:
            media = Path(directory)
            def prepare(_video, output, start, duration, source_id):
                output.mkdir()
                clip = output / 'excerpt.mp4'; clip.write_bytes(b'private source fixture')
                return clip, {**SOURCE, 'id': source_id, 'hasAudio': True}
            def frames(_clip, _source, output, _fps):
                rows = []
                for i in range(2):
                    path = output / f'{i}.jpg'; path.write_bytes(b'fixture frame')
                    rows.append(dict(file=path.name, seconds=i * 10, sha256=sha256(path)))
                return rows
            def encode(command, **_):
                self.assertIn('-an', command)
                Path(command[-1]).write_bytes(b'silent replay fixture')
            with patch('serve.MEDIA', media), patch('serve.prepare', side_effect=prepare), \
                 patch('local_model.prepare_frames', side_effect=frames), \
                 patch('local_model.OllamaClient', return_value=client), \
                 patch('serve.subprocess.run', side_effect=encode), \
                 patch('serve.cloud_token', side_effect=AssertionError('Cloud forbidden')), \
                 patch('serve.analyze', side_effect=AssertionError('Cloud forbidden')):
                with self.post('analyze', {'session': token, 'window': PolicyTests.window(self)}) as reply:
                    batch = json.load(reply)
                self.assertEqual(batch['moments'][0]['startSeconds'], 814)
                self.assertEqual(batch['moments'][0]['spanish'], 'El jugador pasa hacia atrás.')
                self.assertEqual(batch['story'][0]['eventId'], batch['moments'][0]['id'])
                url = f"http://127.0.0.1:{self.server.server_port}/" + batch['moments'][0]['replayPath']
                request = urllib.request.Request(url, headers={'Range': 'bytes=0-5'})
                with urllib.request.urlopen(request) as replay:
                    self.assertEqual(replay.status, 206)
                    self.assertEqual(replay.read(), b'silent')
                self.assertEqual(len(list(media.glob('*/raw-response.json'))), 1)
                self.assertEqual(len(list(media.glob('*/draft.json'))), 1)
        self.assertEqual(sum(args[0] == '/api/chat' for args, _ in client.request.call_args_list), 1)
        self.assertEqual(self.policy.total, 1)
        self.assertFalse(self.policy.busy)

    def test_local_failure_is_sanitized_and_not_retried_or_sent_to_cloud(self):
        from urllib.error import HTTPError
        from test_recognize import SOURCE
        token = self.start()
        with patch('serve.prepare', return_value=(Path('clip.mp4'), SOURCE)), \
             patch('local_model.analyze_local', side_effect=ValueError('private provider details')) as local, \
             patch('serve.cloud_token', side_effect=AssertionError('Cloud forbidden')), \
             patch('serve.analyze', side_effect=AssertionError('Cloud forbidden')):
            with self.assertRaises(HTTPError) as caught:
                self.post('analyze', {'session': token, 'window': PolicyTests.window(self)})
            self.assertNotIn('private', caught.exception.read().decode())
            local.assert_called_once()
        self.assertEqual(self.policy.total, 1)
        self.assertFalse(self.policy.busy)

    def test_stop_during_local_work_discards_result_and_preserves_busy_guard(self):
        from urllib.error import HTTPError
        from test_recognize import SOURCE
        token = self.start()
        def stop_inference(*args, **kwargs):
            with self.post('stop', {'session': token}) as reply:
                self.assertEqual(reply.status, 200)
            self.assertTrue(self.policy.busy)
            return {'observations': [], 'story': []}
        with patch('serve.prepare', return_value=(Path('clip.mp4'), SOURCE)), \
             patch('local_model.analyze_local', side_effect=stop_inference):
            with self.assertRaises(HTTPError) as caught:
                self.post('analyze', {'session': token, 'window': PolicyTests.window(self)})
        self.assertEqual(caught.exception.code, 409)
        self.assertFalse(self.policy.busy)
        self.assertIsNone(self.policy.session)


class ProviderTests(unittest.TestCase):
    def test_default_cloud_and_explicit_local_configurations(self):
        self.assertEqual(parse_provider([]), Provider())
        local = parse_provider(['--provider', 'ollama', '--visual-only'])
        self.assertEqual(local.name, 'ollama')
        self.assertEqual(local.model, 'qwen3-vl:8b')
        self.assertEqual(local.project, '')
        self.assertIsNone(local.whisper_model)

    def test_invalid_or_ambiguous_configuration_fails_before_serving(self):
        import io
        variants = [['--provider', 'ollama'], ['--visual-only'],
                    ['--provider', 'ollama', '--visual-only', '--project', 'arenavoca'],
                    ['--provider', 'ollama', '--visual-only', '--model', 'qwen3-vl:8b-cloud'],
                    ['--provider', 'ollama', '--visual-only', '--fps', '4'],
                    ['--provider', 'ollama', '--visual-only', '--context-tokens', '65536'],
                    ['--context-tokens', '49152'],
                    ['--provider', 'ollama', '--visual-only', '--local-timeout', 'nan'],
                    ['--provider', 'ollama', '--whisper-model', 'missing-model']]
        with patch('sys.stderr', new_callable=io.StringIO):
            for args in variants:
                with self.subTest(args=args), self.assertRaises(SystemExit): parse_provider(args)

    def test_local_commentary_settings_reach_adapter_without_cloud_credentials(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            for name in ('model.bin', 'config.json', 'tokenizer.json'): (path / name).touch()
            provider = parse_provider(['--provider', 'ollama', '--whisper-model', directory,
                                       '--model', 'qwen3-vl:4b', '--fps', '2', '--local-timeout', '240'])
            with patch('local_model.analyze_local', return_value={}) as local, \
                 patch('serve.cloud_token', side_effect=AssertionError('Cloud forbidden')):
                provider.analyze('clip', {'source': 'fixture'}, path)
            local.assert_called_once_with('clip', {'source': 'fixture'}, 'football', 'qwen3-vl:4b', path,
                                          fps=2, whisper_model=path, timeout=240, context_tokens=16384, time_labels=False, frame_width=640)

    def test_explicit_instruct_choice_reaches_local_adapter(self):
        provider = parse_provider(['--provider', 'ollama', '--visual-only',
                                  '--model', 'qwen3-vl:8b-instruct', '--fps', '2', '--context-tokens', '49152', '--frame-time-labels', '--frame-width', '960'])
        with patch('local_model.analyze_local', return_value={}) as local, \
             patch('serve.cloud_token', side_effect=AssertionError('Cloud forbidden')):
            provider.analyze('clip', {}, 'output')
        local.assert_called_once_with('clip', {}, 'football', 'qwen3-vl:8b-instruct', 'output',
                                      fps=2, whisper_model=None, timeout=180, context_tokens=49152, time_labels=True, frame_width=960)

    def test_cloud_still_uses_explicit_project_and_original_adapter(self):
        with patch('serve.cloud_token', return_value='fixture') as token, \
             patch('serve.analyze', return_value={'observations': []}) as cloud, \
             patch('local_model.analyze_local', side_effect=AssertionError('Local forbidden')):
            Provider(project='arenavoca').analyze('clip', {}, 'output')
        token.assert_called_once_with('arenavoca')
        cloud.assert_called_once_with('clip', {}, 'football', 'gemini-3.8-flash', 'fixture', 'output', project='arenavoca')


if __name__ == '__main__': unittest.main()
