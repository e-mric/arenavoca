"""Prepare optional private mobile replay clips from the exact local source."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path


def clip_specs(pack):
    duration = pack["source"]["durationSeconds"]
    specs = []
    for card in pack["cards"]:
        evidence = card["evidence"]
        start, end = evidence["startSeconds"], evidence["endSeconds"]
        if not (isinstance(start, int) and isinstance(end, int) and 0 <= start < end <= duration):
            raise ValueError("Invalid recording range")
        if evidence["sourceId"] != pack["source"]["id"]:
            raise ValueError("Mismatched source")
        specs.append((f"match_{start}_{end}", max(0, start - 2), end))
    if len({name for name, _, _ in specs}) != len(specs):
        raise ValueError("Duplicate clip ranges")
    return specs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--video", type=Path, required=True)
    parser.add_argument("--pack", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True, help="Ignored local-media/res/raw directory")
    args = parser.parse_args()
    pack = json.loads(args.pack.read_text())
    with args.video.open("rb") as source:
        hasher = hashlib.sha256()
        for chunk in iter(lambda: source.read(8 * 1024 * 1024), b""):
            hasher.update(chunk)
        digest = hasher.hexdigest()
    if digest != pack["source"]["sha256"]:
        parser.error("Recording hash does not match the pack; refusing incorrect clips.")
    specs = clip_specs(pack)
    args.output.mkdir(parents=True, exist_ok=True)
    for name, start, end in specs:
        output = args.output / f"{name}.mp4"
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(start),
                        "-i", str(args.video), "-t", str(end - start), "-map", "0:v:0", "-map", "0:a:0",
                        "-vf", "scale=960:-2", "-c:v", "libx264", "-preset", "fast", "-crf", "24",
                        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart",
                        str(output)], check=True)
        info = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(output)]))
        if abs(float(info["format"]["duration"]) - (end - start)) > 0.15:
            raise RuntimeError(f"Unexpected clip duration: {name}")
    print(f"Prepared {len(specs)} private clips with original commentary. Do not commit these recordings.")


if __name__ == "__main__":
    main()
