"""Original unbranded tactical sequence. Requires Pillow and ffmpeg; no external footage.
Run from any directory: python render_sequence.py. Frames stream directly to ffmpeg.
"""
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "res"
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
def font(size):
    try:
        return ImageFont.truetype(FONT, size)
    except OSError:
        return ImageFont.load_default(size=size)

def lerp(a, b, t):
    t = max(0, min(1, t))
    return tuple(x + (y-x)*t for x, y in zip(a, b))

def frame(t):
    im = Image.new("RGB", (960, 540), "#102e2c")
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((38, 66, 922, 490), 16, fill="#236b57")
    for x in range(40, 920, 110):
        d.rectangle((x, 68, x+55, 488), fill="#28745d")
    line = "#b9d6bb"
    d.rectangle((60, 84, 900, 470), outline=line, width=3)
    d.line((480, 84, 480, 470), fill=line, width=3)
    d.ellipse((414, 211, 546, 343), outline=line, width=3)
    d.rectangle((770, 174, 900, 380), outline=line, width=3)
    d.rectangle((900, 230, 930, 324), outline="#fff8e8", width=5)
    d.rectangle((60, 174, 190, 380), outline=line, width=3)
    a, b, target = (270, 355), (590, 230), (878, 296)
    striker = lerp(b, (710, 245), (t-10)/6)
    ball = lerp(a, b, (t-4)/4) if t < 10 else (
        lerp(b, (710,245), (t-10)/6) if t < 16 else lerp((710,245), target, (t-16)/4))
    keeper = lerp((875, 258), target, (t-18)/2)
    for p, colour, label in [(a,"#2d59ff","7"), (striker,"#2d59ff","9"),
                             ((530,360),"#ffb564","4"), ((745,166),"#ffb564","6"),
                             (keeper,"#ef887d","1")]:
        x,y=p
        d.ellipse((x-20,y-18,x+20,y+22), fill="#173e36")
        d.ellipse((x-18,y-22,x+18,y+14), fill=colour, outline="#fff8e8", width=2)
        d.text((x,y-4), label, fill="white", font=font(19), anchor="mm")
    x,y=ball
    d.ellipse((x-9,y+12,x+9,y+30),fill="#fff9ec",outline="#182645",width=3)
    if t >= 20:
        d.arc((846,265,912,331),0,350,fill="#fff9ec",width=3)
    d.text((42,22), "BLUE  0 : 0  AMBER",fill="#fff9ec",font=font(22))
    d.text((918,24),"ILLUSTRATED DEMO",fill="#bbd9c8",font=font(17),anchor="ra")
    caption = ("Blue build an attack." if t < 4 else "A pass finds a teammate." if t < 10
               else "The attacker moves towards goal." if t < 16 else "A shot towards the corner."
               if t < 20 else "The goalkeeper stops the ball. No goal.")
    d.text((480,515), caption,fill="#fff9ec",font=font(23),anchor="mm")
    return im

if __name__ == "__main__":
    (OUT/"raw").mkdir(parents=True,exist_ok=True)
    (OUT/"drawable-nodpi").mkdir(parents=True,exist_ok=True)
    proc = subprocess.Popen(["ffmpeg","-y","-loglevel","error","-f","rawvideo","-pix_fmt","rgb24",
        "-s","960x540","-r","24","-i","-","-an","-c:v","libx264","-crf","23","-pix_fmt","yuv420p",
        "-movflags","+faststart",str(OUT/"raw/tv_football.mp4")],stdin=subprocess.PIPE)
    for n in range(36*24):
        proc.stdin.write(frame(n/24).tobytes())
    proc.stdin.close()
    if proc.wait(): raise RuntimeError("ffmpeg failed")
    banner=Image.new("RGB",(320,180),"#fff8ee")
    d=ImageDraw.Draw(banner)
    d.text((160,72),"ArenaVoca",font=font(37),anchor="mm",fill="#17234e")
    d.text((160,119),"FOOTBALL · SPANISH",font=font(16),anchor="mm",fill="#2d59ff")
    banner.save(OUT/"drawable-nodpi/tv_banner.png")
