import unittest
from serve import RunPolicy


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


if __name__ == '__main__': unittest.main()

# Real HTTP boundary checks use a fake inference function; never call a paid API.
class HttpTests(unittest.TestCase):
    def setUp(self):
        import threading
        from http.server import ThreadingHTTPServer
        from serve import handler
        self.policy = RunPolicy(lambda: 0)
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), handler(self.policy, 'arenavoca', lambda *_: {}))
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

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
        with self.assertRaises(HTTPError) as error: self.post('start', {'position': 808}, origin=False)
        self.assertEqual(error.exception.code, 403)
        self.assertIsNone(self.policy.session)

    def test_future_request_does_not_spend_model_budget(self):
        import json
        from urllib.error import HTTPError
        from unittest.mock import patch
        with patch('serve.VIDEO') as video:
            video.is_file.return_value = True
            with self.post('start', {'position': 808}) as response:
                session = json.load(response)['session']
        with self.assertRaises(HTTPError):
            self.post('analyze', {'session': session, 'window': {'sourceId': 'barca-2018-full', 'startSeconds': 808, 'endSeconds': 828}})
        self.assertEqual(self.policy.total, 0)
        with self.post('stop', {'session': session}) as response: self.assertEqual(response.status, 200)
        self.assertIsNone(self.policy.session)
