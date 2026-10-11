"""Original offline animation. Run using Blender --background --python scripts/render-match.py.
The same normalized pass endpoints feed the app's tactical illustration.
"""
import bpy, json, math, os
from pathlib import Path
from mathutils import Vector
ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'content-source/play.json').read_text())
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='BLENDER_WORKBENCH'
scene.render.resolution_x=1280; scene.render.resolution_y=720; scene.render.resolution_percentage=100
scene.render.fps=30; scene.frame_start=1; scene.frame_end=900
scene.render.image_settings.file_format='PNG'; scene.render.filepath=str(ROOT/'content-source/frames/frame-')
scene.display.shading.light='STUDIO'; scene.display.shading.color_type='MATERIAL'
scene.display.shading.show_shadows=True; scene.display.shading.show_cavity=True
scene.display.shading.cavity_type='BOTH'; scene.display.shading.background_type='WORLD'
scene.world.color=(0.035,0.045,0.06)
scene.view_settings.view_transform='Standard'
def material(name,color):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); return m
pitch=material('Pitch',(0.085,0.29,0.15)); stripe=material('Grass stripe',(0.10,0.34,0.18))
white=material('Warm white',(0.9,0.93,0.85)); blue=material('Blue team',(0.11,0.38,0.90))
amber=material('Amber team',(0.96,0.57,0.12)); dark=material('Shorts',(0.06,0.10,0.17)); skin=material('Anonymous players',(0.62,0.43,0.30))
rail=material('Stadium charcoal',(0.08,0.10,0.13))
def cube(name,loc,scale,mat):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.name=name; o.scale=scale; o.data.materials.append(mat); return o
def line(name,pts,width=.025,mat=white):
 curve=bpy.data.curves.new(name,'CURVE'); curve.dimensions='3D'; curve.bevel_depth=width; curve.bevel_resolution=0
 spline=curve.splines.new('POLY'); spline.points.add(len(pts)-1)
 for p,co in zip(spline.points,pts): p.co=(*co,1)
 o=bpy.data.objects.new(name,curve); bpy.context.collection.objects.link(o); o.data.materials.append(mat); return o
def xy(p,z=.03): return ((p[0]-.5)*21,(.5-p[1])*13.6,z)
cube('Grass', (0,0,-.12),(23,15.6,.2),pitch)
for i in range(10): cube('Mown stripe',(-10.5+(i+.5)*2.1,0,.001),(2.1,13.6,.008),pitch if i%2 else stripe)
line('Boundary',[(-10.5,-6.8,.03),(10.5,-6.8,.03),(10.5,6.8,.03),(-10.5,6.8,.03),(-10.5,-6.8,.03)])
line('Halfway',[(0,-6.8,.03),(0,6.8,.03)])
line('Centre circle',[(1.83*math.cos(i*math.tau/80),1.83*math.sin(i*math.tau/80),.03) for i in range(81)])
for side in [-1,1]:
 x=side*10.5
 line('Penalty area',[(x,-4.0,.03),(x-side*3.3,-4.0,.03),(x-side*3.3,4,.03),(x,4,.03)])
 line('Goal area',[(x,-1.85,.03),(x-side*1.1,-1.85,.03),(x-side*1.1,1.85,.03),(x,1.85,.03)])
 line('Goal frame',[(x,-.75,0),(x,-.75,1.2),(x,.75,1.2),(x,.75,0)],.045)
 line('Goal back',[(x+side*.65,-.75,0),(x+side*.65,-.75,1),(x+side*.65,.75,1),(x+side*.65,.75,0)],.025)
 for v in range(7):
  y=-.75+v*.25; line('Goal net',[(x,y,1.2),(x+side*.65,y,1),(x+side*.65,y,0)],.008)
for y in [-9,9]:
 for j in range(3): cube('Stand',(0,y+math.copysign(j*.7,y),j*.35),(26,.6,.4),rail)
def sphere(name,loc,r,mat):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=r,location=loc); o=bpy.context.object; o.name=name; o.data.materials.append(mat); return o
for p in data['players']:
 pos=xy(p['position'],0); root=bpy.data.objects.new(p['id'],None); bpy.context.collection.objects.link(root); root.location=pos
 jersey=blue if p['team']=='blue' else amber
 for name,loc,scale,mat in [('Jersey',(0,0,.62),(.32,.2,.4),jersey),('Shorts',(0,0,.36),(.31,.2,.15),dark),('Left leg',(-.09,0,.17),(.10,.12,.28),skin),('Right leg',(.09,0,.17),(.10,.12,.28),skin),('Left arm',(-.22,0,.59),(.10,.12,.33),skin),('Right arm',(.22,0,.59),(.10,.12,.33),skin)]:
  o=cube(name,loc,scale,mat); o.parent=root
 head=sphere('Head',(0,0,.95),.13,skin); head.parent=root
 # Gentle movement before and after the matching pass. Keep replay endpoints exact.
 for t,dx in [(0,-.2),(4,0),(6,0),(8,0),(12,0),(15,0),(21,.35),(30,.8)]:
  root.location=(pos[0]+dx,pos[1],0); root.keyframe_insert('location',frame=round(t*30)+1)
ball=sphere('Ball',xy(data['pass']['from'],.13),.12,white)
p=data['pass']; a=p['from']; b=p['to']
for t,pt in [(0,a),(6,a),(8,b),(11.95,b),(12,a),(15,b),(21,b),(25,[.72,.41]),(30,[.75,.41])]:
 ball.location=xy(pt,.13); ball.keyframe_insert('location',frame=min(900,round(t*30)+1))
for fc in ball.animation_data.action.layers[0].strips[0].channelbag(ball.animation_data.action.slots[0]).fcurves:
 for k in fc.keyframe_points: k.interpolation='LINEAR'
bpy.ops.object.camera_add(location=(13,-23,27)); camera=bpy.context.object
camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler(); camera.data.type='ORTHO'; camera.data.ortho_scale=27
scene.camera=camera
(ROOT/'content-source/frames').mkdir(exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'content-source/passing-play.blend'))
if os.environ.get('MATCH_RENDER_STILL'):
 scene.frame_set(220); scene.render.filepath=str(ROOT/'content-source/render-preview.png'); bpy.ops.render.render(write_still=True)
else: bpy.ops.render.render(animation=True)
