"""Prepare private replay clips and provisional macOS Spanish speech.
Run from app/: python3 src/features/match-lab/prepare-media.py
Recordings remain ignored under public/media/user/. Spanish review pending.
"""
import json
import pathlib
import subprocess
import tempfile

pack = json.loads(pathlib.Path('src/features/stories/content/barca-2018-opening.json').read_text())
generated = json.loads(pathlib.Path('src/features/match-lab/content/alba-generated.json').read_text())
# Corrected windows replace the original Alba clips, including a lead-in to the finish.
clips = {card['id']: card for card in pack['cards'] + generated['cards']}
for name, card in clips.items():
    evidence = card['evidence']
    subprocess.run([
        'ffmpeg', '-y', '-loglevel', 'error', '-ss', str(evidence['startSeconds']),
        '-i', 'public/media/user/barca-2018-h264.mp4',
        '-t', str(evidence['endSeconds'] - evidence['startSeconds']), '-an',
        '-vf', 'scale=854:-2', '-c:v', 'libx264', '-preset', 'fast', '-crf', '24',
        '-movflags', '+faststart', f'public/media/user/{name}.mp4',
    ], check=True)

# Keep the board's original phrase audio; cards and stories get distinct recordings.
speech = {card['id']: card['spanish'] for card in pack['cards']}
speech.update({f"lab-generated-{card['id']}": card['spanish'] for card in generated['cards']})
for story in [pack['stories'][0], *generated['stories']]:
    for index, text in enumerate(story['sceneSpanish'], 1):
        speech[f"lab-story-{story['id']}-{index}"] = text
for name, text in speech.items():
    with tempfile.TemporaryDirectory() as tmp:
        aiff = f'{tmp}/speech.aiff'
        subprocess.run(['say', '-v', 'Mónica', '-r', '140', '-o', aiff, text], check=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', aiff,
                        f'public/audio/{name}-es.mp3'], check=True)
print(f'{len(clips)} silent excerpts and {len(speech)} provisional Spanish readings prepared.')
