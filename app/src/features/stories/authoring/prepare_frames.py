"""Re-extract each declared evidence sequence from the exact local recording."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--video", type=Path, required=True)
    parser.add_argument("--pack", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    pack = json.loads(args.pack.read_text())
    digest = hashlib.sha256()
    with args.video.open("rb") as recording:
        for chunk in iter(lambda: recording.read(8 * 1024 * 1024), b""):
            digest.update(chunk)
    if digest.hexdigest() != pack["source"]["sha256"]:
        parser.error("This recording does not match the pack. Do not reuse its timestamps.")
    from PIL import Image, ImageDraw
    args.output.mkdir(parents=True, exist_ok=True)
    for card in pack["cards"]:
        frames = card["evidence"]["frameSeconds"]
        sheet = Image.new("RGB", (1280, ((len(frames) + 1) // 2) * 390), "white")
        draw = ImageDraw.Draw(sheet)
        for index, seconds in enumerate(frames):
            path = args.output / f"frame-{seconds}.jpg"
            subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(seconds), "-i", str(args.video), "-frames:v", "1", "-vf", "scale=640:-1", str(path)], check=True)
            x, y = (index % 2) * 640, (index // 2) * 390
            with Image.open(path) as frame:
                sheet.paste(frame, (x, y + 30))
            draw.text((x + 12, y + 8), f"Recording {seconds // 60}:{seconds % 60:02d} ({seconds}s)", fill="black")
        sheet.save(args.output / f"{card['id']}-evidence.jpg", quality=90)
    print(f"Recreated evidence for {len(pack['cards'])} cards. Keep these broadcast frames local.")


if __name__ == "__main__":
    main()
