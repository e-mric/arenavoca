"""Honest layouts: unchanged source image crops beside actual Blender render pixels.
No image generation, retouching, compositing of character features or painted fixes.
Requires Pillow (python3 -m pip install Pillow if absent).
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageChops
HERE=Path(__file__).resolve().parent;OUT=HERE/'previews';BG='#fffaf2';INK='#19264e'
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'
def font(size):return ImageFont.truetype(FONT,size) if Path(FONT).exists() else ImageFont.load_default(size=size)
def fit(im,box):
 im=im.copy();im.thumbnail(box,Image.Resampling.LANCZOS);return im
def crop_render(path):
 im=Image.open(path).convert('RGB');bg=Image.new('RGB',im.size,im.getpixel((5,5)));diff=ImageChops.difference(im,bg).convert('L').point(lambda p:255 if p>16 else 0);bounds=diff.getbbox()
 if bounds:
  a,b,c,d=bounds;im=im.crop((max(0,a-20),max(0,b-20),min(im.width,c+20),min(im.height,d+20)))
 return im
concept=Image.open(HERE/'approved-concept.png').convert('RGB').crop((75,20,650,915));hero=crop_render(OUT/'hero.png')
sheet=Image.new('RGB',(1600,1160),BG);draw=ImageDraw.Draw(sheet)
for im,label,x in [(concept,'Approved concept · Hello crop',20),(hero,'Actual Blender model · v3',820)]:
 im=fit(im,(760,1000));sheet.paste(im,(x+(760-im.width)//2,90+(1000-im.height)//2));draw.text((x+20,28),label,fill=INK,font=font(33))
draw.line((800,90,800,1090),fill='#dfd5c7',width=2)
draw.text((40,1115),'Left: unchanged approved concept crop. Right: actual render of the delivered editable .blend.',fill='#68617b',font=font(22))
sheet.save(OUT/'concept-vs-model.png');fit(sheet,(640,480)).save(OUT/'comparison-review.jpg',quality=92)
review=Image.new('RGB',(640,480),BG);d=ImageDraw.Draw(review)
for i,(filename,label) in enumerate([('front.png','FRONT'),('quarter.png','QUARTER'),('back.png','BACK'),('side.png','SIDE'),('top.png','TOP'),('clay.png','CLAY · QUARTER')]):
 x=(i%3)*213;y=(i//3)*240;im=fit(Image.open(OUT/filename).convert('RGB'),(211,211));review.paste(im,(x+(213-im.width)//2,y+24+(211-im.height)//2));d.text((x+9,y+7),label,font=font(12),fill=INK)
review.save(OUT/'inspection-sheet.jpg',quality=94)
# The earlier editable Blender candidate is included only as historical comparison.
triple=Image.new('RGB',(1800,1030),BG);d=ImageDraw.Draw(triple)
for i,(im,label) in enumerate([(concept,'Approved concept'),(crop_render(HERE.parent/'kawaii-player-v2/previews/hero.png'),'Blender v2'),(hero,'Blender v3')]):
 im=fit(im,(560,900));triple.paste(im,(i*600+(600-im.width)//2,75+(900-im.height)//2));d.text((i*600+45,25),label,font=font(30),fill=INK)
d.text((40,990),'Comparison only: reference pixels and actual v2/v3 renders. Lighting and pose differ; neither model is runtime approved.',font=font(19),fill='#68617b');triple.save(OUT/'concept-v2-v3.png')
print('Created concept comparison, compact inspection sheet, and v2/v3 comparison.')
