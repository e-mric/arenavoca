"""Lay out unchanged concept pixels beside the actual Blender render; needs Pillow."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageChops
HERE=Path(__file__).resolve().parent
BG='#fffaf2';INK='#142352'
concept=Image.open(HERE/'approved-concept.png').convert('RGB').crop((75,20,650,915))
render=Image.open(HERE/'previews/hero.png').convert('RGB')
background=Image.new('RGB',render.size,render.getpixel((5,5)))
diff=ImageChops.difference(render,background).convert('L').point(lambda p:255 if p>9 else 0)
bounds=diff.getbbox()
if bounds:
 a,b,c,d=bounds;pad=25;render=render.crop((max(0,a-pad),max(0,b-pad),min(render.width,c+pad),min(render.height,d+pad)))
sheet=Image.new('RGB',(1660,1140),BG);draw=ImageDraw.Draw(sheet)
fontpath=Path('/System/Library/Fonts/Supplemental/Arial.ttf')
font=ImageFont.truetype(str(fontpath),34) if fontpath.exists() else ImageFont.load_default(size=34)
small=ImageFont.truetype(str(fontpath),20) if fontpath.exists() else ImageFont.load_default(size=20)
for im,label,x in [(concept,'Approved kawaii concept',40),(render,'Actual Blender model · version 2',860)]:
 im.thumbnail((750,970),Image.Resampling.LANCZOS)
 sheet.paste(im,(x+(750-im.width)//2,95+(970-im.height)//2))
 box=draw.textbbox((0,0),label,font=font);draw.text((x+(750-(box[2]-box[0]))//2,34),label,font=font,fill=INK)
draw.line((830,90,830,1075),fill='#e5ddcf',width=2)
draw.text((40,1100),'Left: approved concept image. Right: render of the editable 3D model.',font=small,fill='#66647d')
sheet.save(HERE/'previews/concept-vs-model.png')
sheet.thumbnail((640,440),Image.Resampling.LANCZOS);sheet.save('/tmp/kawaii-v2-final-comparison.jpg',quality=92)
