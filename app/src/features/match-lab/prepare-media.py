"""Prepare optional PRIVATE replay clips and provisional macOS Spanish speech.
Run from app/: python3 src/features/match-lab/prepare-media.py
Recordings and posters remain ignored under public/media/user/.
Speech: macOS Mónica, 140 words/minute; fluent Spanish/audio review pending.
"""
import json, pathlib, subprocess, tempfile
pack=json.loads(pathlib.Path('src/features/stories/content/barca-2018-opening.json').read_text())
for card in pack['cards']:
    evidence=card['evidence']; name=card['id']
    clip=f'public/media/user/{name}.mp4'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(evidence['startSeconds']),'-i','public/media/user/barca-2018-h264.mp4','-t',str(evidence['endSeconds']-evidence['startSeconds']),'-an','-vf','scale=854:-2','-c:v','libx264','-preset','fast','-crf','24','-movflags','+faststart',clip],check=True)
    with tempfile.TemporaryDirectory() as tmp:
        speech=f'{tmp}/speech.aiff'
        subprocess.run(['say','-v','Mónica','-r','140','-o',speech,card['spanish']],check=True)
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',speech,f'public/audio/{name}-es.mp3'],check=True)
print('Six silent excerpts and six provisional Spanish readings prepared.')
