"""Local recorded-as-live development service. Not a public production backend.
Local: python3 src/features/match-recognition/serve.py --provider ollama --visual-only
Cloud: python3 src/features/match-recognition/serve.py --provider gemini --project arenavoca
Vite forwards /api/recognition to this loopback-only service. Six model calls per
process, three per explicit session, one in flight; no automatic retries.
"""
from __future__ import annotations
import argparse
import json
import math
import re
import secrets
import subprocess
import threading
import time
from dataclasses import dataclass
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

from recognize import APP, OUTPUT_ROOT, prepare, analyze, cloud_token, cloud_endpoint

VIDEO = APP / 'public/media/user/barca-2018-h264.mp4'
MEDIA = OUTPUT_ROOT / 'stream'
PREFIX = '/api/recognition/'


@dataclass(frozen=True)
class Provider:
    """Server-owned inference choice; browsers cannot change providers or paths."""
    name: str = 'gemini'
    model: str = 'gemini-3.8-flash'
    project: str = 'arenavoca'
    fps: float = 1
    whisper_model: Path | None = None
    timeout: float = 180

    def analyze(self, clip, source, output):
        if self.name == 'ollama':
            from local_model import analyze_local
            return analyze_local(clip, source, 'football', self.model, output,
                                 fps=self.fps, whisper_model=self.whisper_model,
                                 timeout=self.timeout)
        if self.name != 'gemini':
            raise ValueError('Unsupported inference provider.')
        return analyze(clip, source, 'football', self.model, cloud_token(self.project),
                       output, project=self.project)


class RunPolicy:
    """Server-side wall-clock watermark complements the client's playback clock."""
    def __init__(self, clock=time.monotonic):
        self.clock = clock
        self.session = None
        self.total = 0
        self.busy = False
        self.lock = threading.Lock()

    def start(self, position):
        if type(position) not in (int, float) or not math.isfinite(position) or not 0 <= position < 5961:
            raise ValueError('Invalid recording position.')
        with self.lock:
            if self.busy or (self.session and self.clock() - self.session['created'] < 300):
                raise ValueError('Another analysis test is active. Stop it or wait five minutes.')
            if self.total >= 6:
                raise ValueError('Development budget reached. Restart the local service to run another test.')
            token = secrets.token_hex(24)
            self.session = dict(token=token, start=position, created=self.clock(), attempts=0, last_end=position)
            return token

    def claim(self, token, window):
        with self.lock:
            run = self.session
            if not run or not isinstance(token, str) or not secrets.compare_digest(token, run['token']):
                raise ValueError('Unknown analysis session.')
            if self.clock() - run['created'] >= 300:
                raise ValueError('Analysis session expired.')
            if not isinstance(window, dict) or set(window) != {'sourceId', 'startSeconds', 'endSeconds'}:
                raise ValueError('Invalid analysis window.')
            start, end = window['startSeconds'], window['endSeconds']
            if window['sourceId'] != 'barca-2018-full' or any(type(v) not in (int, float) or not math.isfinite(v) for v in [start, end]):
                raise ValueError('Unsupported source or time.')
            if not (run['start'] <= start < end <= min(5961, run['start'] + self.clock() - run['created'] + .75)) or not 2 <= end - start <= 20.01:
                raise ValueError('Only already elapsed footage may be analysed.')
            if self.busy or run['attempts'] >= 3 or self.total >= 6 or end < run['last_end'] + 16:
                raise ValueError('Analysis is busy or the test limit has been reached.')
            self.busy = True
            self.total += 1
            run['attempts'] += 1
            run['last_end'] = end

    def finish(self, token):
        with self.lock:
            self.busy = False
            return bool(self.session and self.session['token'] == token)

    def stop(self, token):
        with self.lock:
            if self.session and self.session['token'] == token:
                self.session = None


def produce(window, provider):
    started = time.monotonic()
    job = secrets.token_hex(8)
    output = MEDIA / job
    clip, source = prepare(VIDEO, output, window['startSeconds'],
                           window['endSeconds'] - window['startSeconds'], window['sourceId'])
    draft = provider.analyze(clip, source, output)
    moments = []
    for event in draft['observations']:
        if event['status'] != 'needs-review':
            continue
        # Keep one second of lead-in and follow-through, bounded to observed footage.
        start = max(0, event['startSeconds'] - 1)
        end = min(source['durationSeconds'], event['endSeconds'] + 1)
        replay = output / f"{event['id']}.mp4"
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(start), '-i', str(clip),
                        '-t', str(end - start), '-an', '-vf', 'scale=854:-2', '-c:v', 'libx264',
                        '-preset', 'fast', '-crf', '24', '-movflags', '+faststart', str(replay)],
                       check=True, timeout=30, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        moments.append(dict(id=event['id'], action=event['action'],
                            startSeconds=event['recordingStartSeconds'], endSeconds=event['recordingEndSeconds'],
                            spanish=event['spanish'], english=event['english'],
                            visualEvidence=event['visualEvidence'], commentaryEvidence=event['commentaryEvidence'],
                            replayPath=f"api/recognition/media/{job}/{event['id']}.mp4"))
    return dict(window=window, moments=moments,
                story=[{k: s[k] for k in ['eventId', 'spanish', 'english']} for s in draft['story']],
                elapsedSeconds=round(time.monotonic() - started, 2))


def handler(policy, provider, producer=produce):
    # Bind the displayed configuration to this process. A restart/provider change
    # requires reloading the notice and a new explicit Start, before any inference.
    configuration = dict(id=secrets.token_hex(16), provider=provider.name,
                         model=provider.model, evidence='video-audio' if provider.name == 'gemini'
                         else 'frames-transcript' if provider.whisper_model else 'frames')
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass  # Do not log session tokens, provider bodies or private media paths.

        def reply(self, status, body):
            payload = json.dumps(body).encode()
            self.send_response(status)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

        def do_POST(self):
            # Same-origin browser requests only. Vite preserves Host and Origin.
            origin = urlsplit(self.headers.get('Origin', ''))
            if origin.scheme not in ('http', 'https') or origin.netloc != self.headers.get('Host'):
                self.reply(403, {'error': 'Same-origin request required.'})
                return
            try:
                size = int(self.headers.get('Content-Length', '0'))
                if not 0 < size <= 2048 or self.headers.get_content_type() != 'application/json':
                    raise ValueError('Expected a small JSON request.')
                data = json.loads(self.rfile.read(size))
                if not isinstance(data, dict):
                    raise ValueError('Invalid request.')
                if self.path == PREFIX + 'start' and set(data) == {'position', 'configuration'}:
                    if data['configuration'] != configuration['id']:
                        raise ValueError('Analysis configuration changed. Check the service again.')
                    if not VIDEO.is_file():
                        raise ValueError('Private recording is unavailable.')
                    self.reply(200, {'session': policy.start(data['position'])})
                elif self.path == PREFIX + 'stop' and set(data) == {'session'}:
                    policy.stop(data['session'])
                    self.reply(200, {'stopped': True})
                elif self.path == PREFIX + 'analyze' and set(data) == {'session', 'window'}:
                    token = data['session']
                    policy.claim(token, data['window'])
                    try:
                        batch = producer(data['window'], provider)
                    finally:
                        valid = policy.finish(token)
                    if not valid:
                        self.reply(409, {'error': 'Analysis stopped; result discarded.'})
                    else:
                        self.reply(200, batch)
                else:
                    self.reply(404, {'error': 'Unknown endpoint.'})
            except (ValueError, TypeError, OSError, subprocess.SubprocessError):
                # Never forward credential-bearing CLI/provider exceptions.
                try:
                    self.reply(400, {'error': 'Analysis unavailable or test limit reached. No automatic retry.'})
                except (BrokenPipeError, ConnectionResetError):
                    pass

        def do_GET(self):
            if self.path == PREFIX + 'configuration':
                self.reply(200, configuration)
                return
            match = re.fullmatch(PREFIX + r'media/([a-f0-9]{16})/([a-f0-9]{16}-\d+\.mp4)', self.path)
            if not match:
                self.reply(404, {'error': 'Unknown media.'})
                return
            path = MEDIA / match[1] / match[2]
            if not path.is_file():
                self.reply(404, {'error': 'Replay unavailable.'})
                return
            # Media elements use byte-range reads; serve only silent generated excerpts.
            size = path.stat().st_size
            start, end, status = 0, size - 1, 200
            value = self.headers.get('Range')
            if value:
                span = re.fullmatch(r'bytes=(\d+)-(\d*)', value)
                if not span or int(span[1]) >= size:
                    self.reply(416, {'error': 'Unsupported range.'})
                    return
                start, end = int(span[1]), min(int(span[2]) if span[2] else size - 1, size - 1)
                if end < start:
                    self.reply(416, {'error': 'Unsupported range.'})
                    return
                status = 206
            self.send_response(status)
            self.send_header('Content-Type', 'video/mp4')
            self.send_header('Accept-Ranges', 'bytes')
            self.send_header('Cache-Control', 'private, no-store')
            self.send_header('Content-Length', str(end - start + 1))
            if status == 206:
                self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
            self.end_headers()
            try:
                with path.open('rb') as file:
                    file.seek(start)
                    self.wfile.write(file.read(end - start + 1))
            except (BrokenPipeError, ConnectionResetError):
                pass
    return Handler


def parse_provider(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--provider', choices=['gemini', 'ollama'], default='gemini')
    parser.add_argument('--project', help='Cloud project (default arenavoca); Gemini only.')
    parser.add_argument('--model', help='Defaults to gemini-3.8-flash or qwen3-vl:8b.')
    audio = parser.add_mutually_exclusive_group()
    audio.add_argument('--visual-only', action='store_true')
    audio.add_argument('--whisper-model', type=Path, help='Complete local faster-whisper model folder.')
    parser.add_argument('--fps', type=float, default=1)
    parser.add_argument('--local-timeout', type=float, default=180)
    args = parser.parse_args(argv)
    try:
        if args.provider == 'ollama':
            from local_model import MODELS, sample_times, OllamaClient
            if args.project or not (args.visual_only or args.whisper_model):
                raise ValueError('Local mode requires --visual-only or --whisper-model, and no --project.')
            model = args.model or 'qwen3-vl:8b'
            if model not in MODELS:
                raise ValueError('Choose an installed qwen3-vl:8b or qwen3-vl:4b.')
            sample_times(20, args.fps)
            OllamaClient(timeout=args.local_timeout)  # Validate only; no network request.
            if args.whisper_model and not all((args.whisper_model / name).is_file()
                    for name in ('model.bin', 'config.json', 'tokenizer.json')):
                raise ValueError('Whisper needs a complete local model folder; see README.')
            return Provider(name='ollama', model=model, project='', fps=args.fps,
                            whisper_model=args.whisper_model, timeout=args.local_timeout)
        if args.visual_only or args.whisper_model or args.fps != 1 or args.local_timeout != 180:
            raise ValueError('Local evidence options require --provider ollama.')
        cloud_endpoint(args.project or 'arenavoca')
        return Provider(model=args.model or 'gemini-3.8-flash', project=args.project or 'arenavoca')
    except ValueError as error:
        parser.error(str(error))


def main(argv=None):
    provider = parse_provider(argv)
    mode = 'local frames + local commentary' if provider.whisper_model else 'local frames only'
    if provider.name == 'gemini': mode = 'Google Cloud / uploads video + audio'
    print(f'Recorded-as-live on loopback:8788 / {provider.model} / {mode}. '
          'Six model calls maximum; explicit Start required. No automatic fallback.', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8788), handler(RunPolicy(), provider)).serve_forever()


if __name__ == '__main__':
    main()
