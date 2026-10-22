"""Assemble actual Vega captures + ElevenLabs narration. Requires ffmpeg and Pillow.
Usage: python scripts/render-amazon-demo.py /absolute/path/to/capture-directory
No publishing. Capture files and outputs remain outside Git.
"""
import json, subprocess, sys, textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
P=Path(sys.argv[1]).resolve(); E=P/'edit';E.mkdir(exist_ok=True)
CREAM='#FFF9EF';NAVY='#172452';BLUE='#2045F5';LAV='#EAE3FF';CORAL='#FFC1B5'
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'
BOLD='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
def font(size,bold=False): return ImageFont.truetype(BOLD if bold else FONT,size)
def run(args):
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*map(str,args)],check=True)
def duration(path):
    return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(path)]))
def label(im,xy,text,size=40,color=NAVY,bold=False):
    ImageDraw.Draw(im).text(xy,text,font=font(size,bold),fill=color,spacing=18)
def header(title):
    im=Image.new('RGB',(1920,1080),CREAM)
    label(im,(60,15),'ArenaVoca',34,BLUE,True)
    label(im,(370,20),title,27)
    d=ImageDraw.Draw(im); t='Vega simulator · actual capture';d.text((1860-d.textlength(t,font=font(25)),22),t,font=font(25),fill=NAVY)
    return im
# Static editorial frames never replace execution evidence.
intro=Image.new('RGB',(1920,1080),CREAM)
label(intro,(140,110),'ArenaVoca',55,BLUE,True)
label(intro,(140,300),'Your match.\nA little Spanish.',112,NAVY,True)
ImageDraw.Draw(intro).rounded_rectangle((140,655,900,745),radius=40,fill=LAV)
label(intro,(175,672),'Watch. Notice. Remember.',43,NAVY,True)
label(intro,(140,825),'Optional language practice on Fire TV',36)
intro.save(E/'intro.png')
setup=header('Spanish through sport')
label(setup,(70,240),'Watching\ncomes first.',64,NAVY,True)
label(setup,(70,490),'Three moments.\nYour choice.',38)
img=Image.open(P/'fresh-9.png').convert('RGB').resize((1280,720))
setup.paste(img,(580,155));label(setup,(600,895),'Original illustrated sequence · Blue vs Amber',27)
setup.save(E/'setup.png')
tech=header('How it works')
label(tech,(120,185),'A small learning loop,\nbuilt around the match.',66,NAVY,True)
for i,(a,b) in enumerate([('01  React Native + Kepler','Vega UI, remote navigation and media player'),('02  Video-driven moments','The playback clock unlocks prepared cards'),('03  Local progress','Saved phrases and paused position on this device')]):
    y=420+i*165;ImageDraw.Draw(tech).rounded_rectangle((120,y,1800,y+135),radius=24,fill=LAV)
    label(tech,(155,y+15),a,38,NAVY,True);label(tech,(155,y+72),b,30)
tech.save(E/'tech.png')
close=Image.new('RGB',(1920,1080),BLUE)
label(close,(140,140),'ArenaVoca',62,CREAM,True)
label(close,(140,350),'Watch.\nNotice.\nRemember.',100,CREAM,True)
label(close,(145,850),'Spanish through the sport you love.',40,CREAM)
close.save(E/'close.png')
# Each capture is recorded at normal speed, including the continuous learning take.
chapters=[('intro',7,None),('setup',10,None),('watch',39,'05-resize-playing.webm'),('recall',22.14,'02-recall.webm'),('persistence',21.52,'06-persistence.webm'),('tech',16,None),('scope-shot',7.5,'03-shot-detail.webm'),('scope-save',7.5,'04-save-detail.webm'),('close',6,None)]
starts=[];total=0
for name,secs,src in chapters:
    starts.append(total);total+=secs
    out=E/(name+'.mp4')
    if out.exists(): continue
    if not src:
        run(['-loop','1','-i',E/(name+'.png'),'-t',secs,'-r','30','-vf','format=yuv420p','-r','30','-video_track_timescale','15360','-c:v','libx264','-preset','fast','-crf','18','-an',out])
    else:
        title={'watch':'01 · Watch and choose a moment','recall':'02 · Save and practise','persistence':'03 · Close and reopen','scope-shot':'Prepared content · optional practice','scope-save':'Prepared content · optional practice'}[name]
        bg=header(title);bg.save(E/(name+'-frame.png'))
        run(['-i',P/src,'-loop','1','-i',E/(name+'-frame.png'),'-filter_complex','[0:v]fps=30,scale=1600:900,setsar=1,tpad=stop_mode=clone:stop_duration=1[v];[1:v][v]overlay=160:68:shortest=1,format=yuv420p[out]','-map','[out]','-t',secs,'-r','30','-video_track_timescale','15360','-c:v','libx264','-preset','fast','-crf','18','-an',out])
    print('Rendered',name,flush=True)
(E/'chapters.txt').write_text(''.join("file '"+str(E/(c[0]+'.mp4'))+"'\n" for c in chapters))
run(['-f','concat','-safe','0','-i',E/'chapters.txt','-c','copy',E/'picture.mp4'])
# Exact selected take and its Scribe word timings. Four watching paragraphs run
# consecutively against one uncut 39-second real-time remote interaction.
bounds=[0,4.84,12.04,22.30,29.46,40.92,49.82,58.62,67.16,79.26,90.54,94.08]
voice_starts=[.6,7.5,17,27.26,34.42,45.88,56.8,80.0,99.66,115.66,131.16]
# Consecutive watch narration takes 37.78s, fitting the 39s recording unchanged.
words=json.loads((P/'words.json').read_text()); timed=[];audio_filters=[]
for i in range(11):
    a,b=bounds[i],bounds[i+1];start=voice_starts[i]
    audio_filters.append(f'[0:a]atrim=start={a}:end={b},asetpts=PTS-STARTPTS,adelay={round(start*1000)}:all=1[a{i}]')
    for w in words:
        if a<=w['start']<b:
            timed.append({'text':w['text'],'start':start+w['start']-a,'end':start+min(w['end'],b)-a})
audio_filters.append(''.join(f'[a{i}]' for i in range(11))+f'amix=inputs=11:normalize=0,apad=whole_dur={total},asetpts=N/SR/TB,loudnorm=I=-16:TP=-1.5:LRA=11[a]')
run(['-i',P/'narration-selected.mp3','-filter_complex',';'.join(audio_filters),'-map','[a]','-t',total,'-ar','48000','-c:a','pcm_s16le',E/'voice.wav'])
# Caption chunks follow speech and stay out of the app image. No guessed timing.
groups=[];group=[]
for w in timed:
    if group and (len(' '.join(x['text'] for x in group))+len(w['text'])>78 or w['start']-group[-1]['end']>.7):
        groups.append(group);group=[]
    group.append(w)
    if w['text'].endswith(('.', '?','!')) and len(group)>=5:groups.append(group);group=[]
if group:groups.append(group)
def stamp(t):
    ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
srt=[];entries=[];cursor=0
blank=Image.new('RGB',(1920,110),CREAM);blank.save(E/'caption-blank.png')
for i,g in enumerate(groups):
    a=g[0]['start'];b=min(g[-1]['end']+.12,groups[i+1][0]['start'] if i+1<len(groups) else total)
    if a>cursor:entries.append(('caption-blank.png',a-cursor))
    text=' '.join(w['text'] for w in g);lines=textwrap.wrap(text,width=77)
    im=blank.copy();d=ImageDraw.Draw(im);y=10 if len(lines)>1 else 34
    for line in lines:
        f=font(37);d.text(((1920-d.textlength(line,font=f))/2,y),line,font=f,fill=NAVY);y+=44
    name=f'caption-{i:03}.png';im.save(E/name);entries.append((name,b-a));cursor=b
    srt.append(f'{i+1}\n{stamp(a)} --> {stamp(b)}\n'+ '\n'.join(lines)+'\n')
if cursor<total:entries.append(('caption-blank.png',total-cursor))
(P/'ArenaVoca-Amazon-Demo.srt').write_text('\n'.join(srt))
(E/'captions.txt').write_text(''.join(f"file '{E/name}'\nduration {secs:.4f}\n" for name,secs in entries)+f"file '{E/'caption-blank.png'}'\n")
run(['-f','concat','-safe','0','-i',E/'captions.txt','-vf','fps=30,format=yuv420p','-t',total,'-c:v','libx264','-preset','fast','-crf','18',E/'captions.mp4'])
run(['-i',E/'picture.mp4','-i',E/'captions.mp4','-i',E/'voice.wav','-filter_complex','[0:v][1:v]overlay=0:970[v]','-map','[v]','-map','2:a','-t',total,'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',P/'ArenaVoca-Amazon-Demo.mp4'])
(P/'edit-manifest.json').write_text(json.dumps({'chapters':chapters,'starts':starts,'duration':total,'voice_starts':voice_starts,'narration_take':'V0USZOTHnraDnWNEU1FA','actual_vega_capture':True,'published':False},indent=2))
print('Completed',total,'seconds',flush=True)
