"""Real VVD/Appium remote journey. Requires a running ArenaVoca build and Appium.
python3 simulator.py --pack alba --output /tmp/vega-evidence
Uses Linux D-pad/Select/Back events; never substitutes model time or clicks.
"""
import argparse, base64, json, pathlib, re, sys, time, urllib.request
import xml.etree.ElementTree as ET
parser = argparse.ArgumentParser()
parser.add_argument('--pack', choices=['alba','youtube'], required=True)
parser.add_argument('--output', type=pathlib.Path, required=True)
parser.add_argument('--cold-launch', action='store_true')
parser.add_argument('--server', default='http://127.0.0.1:4725')
parser.add_argument('--device', default='emulator-5558')
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
def http(url, data=None, method=None):
    req=urllib.request.Request(url, data=json.dumps(data).encode() if data is not None else None,
                              headers={'Content-Type':'application/json'}, method=method)
    result=json.load(urllib.request.urlopen(req, timeout=30))['value']
    if isinstance(result,dict) and 'error' in result: raise RuntimeError(result)
    return result
session=http(args.server+'/session', {'capabilities':{'alwaysMatch':{
    'platformName':'Kepler','appium:automationName':'automation-toolkit/JSON-RPC',
    'kepler:device':'vda://'+args.device,'appium:appURL':'com.arenavoca.tv.main',
    'appium:newCommandTimeout':600}}})['sessionId']
base=args.server+'/session/'+session
# Retain the session id for additional manual inspection and cold-launch checks.
(args.output/'session.json').write_text(json.dumps({'value':{'sessionId':session}}))
def request(route,data=None): return http(base+route,data)
def elements():
    app=ET.fromstring(request('/source')).find(".//app[@appName='com.arenavoca.tv']")
    assert app is not None, 'ArenaVoca must be running'
    return {e.get('test_id'):e for e in app.iter() if e.get('test_id')}
def no_warning_overlay():
    app=ET.fromstring(request('/source')).find(".//app[@appName='com.arenavoca.tv']")
    visible=' '.join(e.text or '' for e in app.iter('text'))
    assert 'Dismiss' not in visible and 'Uncaught Error' not in visible and 'forwardRef render' not in visible and 'Open debugger to view warnings' not in visible and 'Running debug build of JavaScript' not in visible, 'Development overlay obscures the app'
def key(code):
    request('/execute/sync', {'script':'jsonrpc: injectInputKeyEvent','args':[[{'inputKeyEvent':str(code),'holdDuration':80}]]})
    time.sleep(.45)
def text(id):
    e=elements()[id]
    return e.get('description') or ''.join(e.itertext()).strip()
def position(): return float(re.search(r'at ([\d.]+) seconds',text('playback')).group(1))
def activate(id):
    for _ in range(14):
        es=elements();target=es.get(id)
        assert target is not None, 'Missing control '+id
        focus=next((e for e in es.values() if e.get('focused')=='true'), None)
        assert focus is not None, 'No remote focus'
        if focus.get('test_id')==id: key(96); return
        def center(e): return (float(e.get('x','0'))+float(e.get('width','0'))/2,float(e.get('y','0'))+float(e.get('height','0'))/2)
        tx,ty=center(target);fx,fy=center(focus)
        # A narrow secondary action sits below a full-width focused control.
        # Overlapping horizontal spans mean Down/Up, not Left/Right by centers.
        def span(e,axis,extent):
            start=float(e.get(axis,'0'));return start,start+float(e.get(extent,'0'))
        tx0,tx1=span(target,'x','width');fx0,fx1=span(focus,'x','width')
        ty0,ty1=span(target,'y','height');fy0,fy1=span(focus,'y','height')
        if min(tx1,fx1)>max(tx0,fx0) and (ty0>=fy1 or fy0>=ty1):
            key(108 if ty>fy else 103)
        else:
            key((106 if tx>fx else 105) if abs(tx-fx)>abs(ty-fy) else (108 if ty>fy else 103))
    raise AssertionError('D-pad could not reach '+id)
def watch():
    for _ in range(5):
        if args.pack == 'youtube' and 'learning-panel' not in elements(): return
        if 'watch-surface' in elements(): return
        key(158)
    raise AssertionError('Back did not restore watch')
def controls():
    watch()
    if args.pack != 'youtube': key(108)
    assert 'play-pause' in elements()
def screenshot(name):
    (args.output/(args.pack+'-'+name+'.png')).write_bytes(base64.b64decode(request('/screenshot')))
def wait_for_restart():
    until=time.monotonic()+(45 if args.pack == 'youtube' else 8)
    while position()>=3 or not text('playback').startswith('Playing'):
        assert time.monotonic()<until, 'Restart did not seek: '+text('playback')
        time.sleep(.15)
def wait_until_time(seconds):
    until=time.monotonic()+40
    while position()<seconds:
        assert time.monotonic()<until, 'Playback stopped before '+str(seconds)+': '+text('playback')
        time.sleep(.2)
ids=['alba-run','alba-cutback','coutinho-goal']
ends=[6,9,14]
phrases=['Jordi Alba corre al espacio.','Alba pasa el balón hacia atrás.','Coutinho marca el primer gol.']
if args.cold_launch:
    expected=json.loads((args.output/(args.pack+'-journey.json')).read_text())
    time.sleep(1)
    restored=position()
    assert text('playback').startswith('Paused') and restored>0
    assert abs(restored-expected['position'])<2.5, 'Position was not restored'
    time.sleep(1);assert position()==restored, 'Cold launch autoplayed'
    controls();activate('saved')
    assert all('open-'+id in elements() for id in ids[:2]), 'Save lost on cold launch'
    activate('open-'+ids[1]);assert text('card-phrase')==phrases[1]
    activate('meaning');assert text('card-phrase')==phrases[1];assert 'card-translation' in elements();time.sleep(.5);assert position()==restored, 'Meaning resumed playback'
    no_warning_overlay();screenshot('restored-card')
    result={'pack':args.pack,'position':restored,'saved':ids[:2],'passed':True}
    (args.output/(args.pack+'-cold-launch.json')).write_text(json.dumps(result,indent=2))
    print(json.dumps(result));sys.exit(0)
def set_playing(wanted):
    print('Playback request', wanted, text('playback'), flush=True)
    prefix='Playing' if wanted else 'Paused'
    if not text('playback').startswith(prefix): key(164)
    deadline=time.monotonic()+8
    while not text('playback').startswith(prefix):
        assert time.monotonic()<deadline, 'Media key failed: '+text('playback')
        time.sleep(.1)

def assert_return_visible(id):
    e=elements()[id]
    assert float(e.get('y'))>=0 and float(e.get('y'))+float(e.get('height'))<=1080, 'Return clipped: '+id

def restart():
    controls();activate('moments');activate('about')
    assert 'Source: FC Barcelona YouTube channel' in text('source-details')
    assert 'https://youtu.be/WMjohb2tq7Y' in text('source-details')
    # The release build bundles only the local cut; YouTube stays an opt-in build.
    assert ('switch-source' in elements()) == (args.pack == 'youtube'), 'Unexpected source switch'
    screenshot('source-credit')
    activate('restart');wait_for_restart()

# Pause explicitly while asserting menus: Appium latency must not be mistaken
# for a future-card leak in this short 36-second recording.
if args.pack == 'youtube':
    ready_deadline=time.monotonic()+45
    while elements().get('play-pause') is None or elements()['play-pause'].get('focusable')!='true':
        assert time.monotonic()<ready_deadline, 'YouTube did not become ready'
        assert 'youtube-error' not in elements(), text('youtube-error') if 'youtube-error' in elements() else ''
        time.sleep(.3)
restart();set_playing(False)
assert position()<ends[0], 'Initial check must precede first moment'
controls();activate('moments');assert not any(k.startswith('open-') for k in elements()), 'Future card leaked'
screenshot('empty-moments')
watch();assert float(elements()['playback'].get('width'))==1920
set_playing(True);wait_until_time(ends[0]+.2)
assert 'learning-panel' not in elements() and 'card-phrase' not in elements(), 'Card auto-opened'
screenshot('watch')
if 'watch-surface' in elements() and text('watch-surface')=='Open new moments':
    activate('watch-surface');assert 'open-'+ids[0] in elements(), 'Invitation failed to open moments'
else:
    controls();activate('moments')
set_playing(False)
frozen=position()
print('First card clock', frozen, flush=True)
assert all(('open-'+id in elements())==(end<=frozen) for id,end in zip(ids,ends)), 'Visible cards disagree with playback clock'
activate('open-'+ids[0]);assert text('card-phrase')==phrases[0]
assert float(elements()['playback'].get('width'))==1382
assert float(elements()['card-artwork'].get('width'))<=538 and float(elements()['card-artwork'].get('height'))<=300, 'Artwork escaped panel'
activate('meaning');translation=text('card-translation')
assert text('card-phrase')==phrases[0] and position()==frozen, 'Translation changed Spanish or resumed playback'
set_playing(True);before=position();time.sleep(1.5)
assert position()>before+.5 and text('card-translation')==translation, 'Pinned translation interrupted playback'
set_playing(False);frozen=position()
activate('save-card');assert text('save-card')=='Saved'
assert_return_visible('back-card');screenshot('first-card-english')
activate('recall');activate('answer-0');assert text('recall-feedback')=='Try another action.'
activate('answer-1');assert text('recall-feedback')=='¡Bien hecho!'
assert_return_visible('back-recall');screenshot('recall')
key(158);assert text('card-translation')==translation
activate('back-card');assert 'open-'+ids[0] in elements()
assert position()==frozen, 'Learning controls changed paused clock'
watch();set_playing(True);wait_until_time(ends[2]+.2);set_playing(False)
controls();activate('moments');assert all('open-'+id in elements() for id in ids)
screenshot('moments')
activate('open-'+ids[1]);assert text('card-phrase')==phrases[1]
frozen=position();activate('meaning');assert 'card-translation' in elements() and text('card-phrase')==phrases[1]
assert position()==frozen
assert_return_visible('back-card');screenshot('card-english')
activate('save-card');assert text('save-card')=='Saved'
watch();controls();activate('saved');screenshot('saved-list')
activate('open-'+ids[1]);assert text('card-phrase')==phrases[1] and position()==frozen
screenshot('saved-spanish')
restart();set_playing(False);rewound=position()
controls();activate('saved');activate('open-'+ids[1]);assert text('card-phrase')==phrases[1]
assert position()==rewound, 'Saved card resumed a rewound match'
watch();set_playing(True);wait_until_time(35.9);time.sleep(1)
assert text('playback').startswith('Paused'), 'Sequence did not end'
screenshot('ended-full-before');ended_position=position()
controls();activate('moments');activate('open-'+ids[2]);assert text('card-phrase')==phrases[2]
screenshot('ended-card');watch();time.sleep(.6);screenshot('ended-full-after')
assert position()==ended_position and text('playback').startswith('Paused'), 'Layout changed ended playback'
from PIL import Image, ImageChops, ImageStat
before_frame=Image.open(args.output/(args.pack+'-ended-full-before.png')).convert('RGB')
after_frame=Image.open(args.output/(args.pack+'-ended-full-after.png')).convert('RGB')
render_difference=None
if args.pack != 'youtube':
    render_difference=max(ImageStat.Stat(ImageChops.difference(before_frame.crop((0,100,1920,850)),after_frame.crop((0,100,1920,850)))).mean)
    assert render_difference<3, 'Ended surface changed size: '+str(render_difference)
    for x in (16,1872):
        assert max(ImageStat.Stat(after_frame.crop((x,250,x+32,700))).mean)>30, 'Ended image has empty full-screen edge'
controls();assert text('play-pause')=='Watch again';activate('play-pause');wait_for_restart()
wait_until_time(3);set_playing(False);time.sleep(.4)
no_warning_overlay();screenshot('final-paused')
result={'pack':args.pack,'device':args.device,'position':position(),'saved':ids[:2],
 'end_frame_difference':render_difference,'passed':['remote navigation','timed gating','no auto-open',
 'Spanish plus on-demand English','pinned translation with advancing playback','save and recall',
 'fixed visible return controls','explicit media pause/resume','saved after rewind','source-matched artwork',
 'ended playback stays paused' if args.pack == 'youtube' else 'ended full-screen pixels',
 'watch again','no warning overlay']}
(args.output/(args.pack+'-journey.json')).write_text(json.dumps(result,indent=2))
print(json.dumps(result),flush=True)
