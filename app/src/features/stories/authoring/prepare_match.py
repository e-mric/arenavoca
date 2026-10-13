"""Local speech + frame evidence. Run on Apple Silicon with mlx-whisper and ffmpeg.

This prepares evidence, not automatically approved learning content. Inspect sequential
frames alongside the transcript before describing an action or naming a player.
Keep output under app/content-source/match-analysis/ (ignored by Git).
"""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path


def recording_segments(segments, start):
    """Make a separate recording-relative result, preserving the raw ASR evidence."""
    return [dict(segment, start=segment["start"] + start, end=segment["end"] + start,
                 words=[dict(word, start=word["start"] + start, end=word["end"] + start)
                        for word in segment.get("words", [])]) for segment in segments]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--video", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--start", type=int, default=0)
    parser.add_argument("--duration", type=int, default=1000)
    parser.add_argument("--model", default="mlx-community/whisper-small-mlx")
    parser.add_argument("--language", help="Known commentary language, e.g. en. Crowd intros can mislead automatic detection.")
    args = parser.parse_args()
    if args.start < 0 or not 1 <= args.duration <= 1800:
        parser.error("Choose a nonnegative start and a 1–1800 second passage.")
    if not args.video.is_file():
        parser.error("The local recording was not found.")
    args.output.mkdir(parents=True, exist_ok=True)
    audio = args.output / "commentary.wav"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(args.start),
                    "-t", str(args.duration), "-i", str(args.video), "-vn", "-ac", "1", "-ar", "16000", str(audio)], check=True)
    import mlx_whisper
    result = mlx_whisper.transcribe(str(audio), path_or_hf_repo=args.model, language=args.language, word_timestamps=True, verbose=False)
    # Convert clip-relative ASR times once; consumers use recording time throughout.
    result["segments"] = recording_segments(result["segments"], args.start)
    result["provenance"] = {
        "model": args.model, "startSeconds": args.start, "durationSeconds": args.duration,
        "timebase": "recording-seconds", "audioSha256": hashlib.sha256(audio.read_bytes()).hexdigest(),
        "status": "machine transcript; requires audiovisual review"
    }
    (args.output / "transcript.json").write_text(json.dumps(result, ensure_ascii=False, indent=2))
    (args.output / "segments.txt").write_text("\n".join(
        f'{s["start"]:.2f}–{s["end"]:.2f} {s["text"]}' for s in result["segments"]))
    print(f"Prepared {len(result['segments'])} segments in {args.output}", flush=True)


if __name__ == "__main__":
    main()
