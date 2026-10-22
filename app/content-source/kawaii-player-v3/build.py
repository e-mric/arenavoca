"""Reproduce the original v3 Blender sculpture and actual camera renders.
Run: Blender --background --python build.py -- [--preview-only]
"""
import bpy,sys,json,argparse
from pathlib import Path
from mathutils import Vector
from math import pi
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent;sys.path.insert(0,str(HERE))
from forms import material
from sculpt import build_character,build_ball
parser=argparse.ArgumentParser();parser.add_argument('--preview-only',action='store_true');opts=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.context.preferences.filepaths.save_version=0
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
model=bpy.data.collections.new('PLAYER | original v3 editable sculpture');scene.collection.children.link(model)
mat={k:material(*v) for k,v in {
 'skin':('Skin | warm peach','#f3b47d',.72),'blush':('Blush | coral peach','#ef826e',.80),
 'hair':('Hair | warm chocolate','#50362e',.58),'ink':('Face | dark cocoa','#302522',.52),'brow':('Eyebrows | warm cocoa','#986143',.75),
 'blue':('Jersey | cobalt blue','#1946ee',.68),'navy':('Shorts and boots | deep navy','#202c59',.62),
 'coral':('Collar and soles | warm coral','#ff9d88',.66),'cream':('Cuffs and socks | warm cream','#fff4de',.80),
 'ballcream':('Football | warm ivory','#fff0c9',.70),'seam':('Football | recessed warm seams','#bc9c77',.85)}.items()}
parts,groups=build_character(model,mat)
root=bpy.data.objects.new('ArenaVoca_Kawaii_Player_v3',None);model.objects.link(root)
for group in sorted(set(groups.values())):
 pivot=bpy.data.objects.new(group+' | editable assembly',None);model.objects.link(pivot);pivot.parent=root
 for o in parts:
  if groups[o.name]==group:o.parent=pivot
root['design_status']='v3 visual-review candidate: original Blender geometry, fixed Hello pose based on approved concept.'
root['coordinates']='metres; Z up and -Y front in Blender; Y up and +Z front in glTF.'
root['pose_limits']='Static authored pose with named editable assemblies, not an animation-ready deformation rig.'
ballcollection=bpy.data.collections.new('FOOTBALL | separate portable prop');scene.collection.children.link(ballcollection)
ballparts=build_ball(mat)
for o in ballparts:
 for c in list(o.users_collection):c.objects.unlink(o)
 ballcollection.objects.link(o)
# Exact approved concept, packed unchanged for comparison in the editable project.
refs=bpy.data.collections.new('REFERENCE | packed approved concept, not exported');scene.collection.children.link(refs)
img=bpy.data.images.load(str(HERE/'approved-concept.png'));img.pack();ref=bpy.data.objects.new('Approved concept (unchanged)',None);ref.empty_display_type='IMAGE';ref.data=img;ref.empty_display_size=.30;ref.location=(.23,.05,.12);ref.rotation_euler=(pi/2,0,0);ref.hide_render=True;refs.objects.link(ref);refs.hide_viewport=True
studio=bpy.data.collections.new('STUDIO | presentation only, not exported');scene.collection.children.link(studio)
def stage(o):
 for c in list(o.users_collection):c.objects.unlink(o)
 studio.objects.link(o);return o
lavender=material('Studio | lavender','#d4c2f4',.65);ivory=material('Studio | cream','#fff9ee',.85)
bpy.ops.mesh.primitive_cylinder_add(vertices=96,radius=.060,depth=.007,location=(-.004,-.002,-.004));plinth=stage(bpy.context.object);plinth.name='Lavender display plinth (not exported)';plinth.data.materials.append(lavender)
mod=plinth.modifiers.new('Soft rounded rim','BEVEL');mod.width=.0015;mod.segments=5;bpy.context.view_layer.objects.active=plinth;bpy.ops.object.modifier_apply(modifier=mod.name)
for p in plinth.data.polygons:p.use_smooth=True
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.0076));floor=stage(bpy.context.object);floor.name='Studio floor';floor.data.materials.append(ivory)
scene.world=bpy.data.worlds.new('Warm neutral studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.74,.68,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.40
worldnodes=scene.world.node_tree.nodes;worldlinks=scene.world.node_tree.links
background=worldnodes.new('ShaderNodeBackground');background.inputs[0].default_value=(.99,.95,.88,1);background.inputs[1].default_value=2**.70
lightpath=worldnodes.new('ShaderNodeLightPath');mix=worldnodes.new('ShaderNodeMixShader');worldlinks.new(lightpath.outputs['Is Camera Ray'],mix.inputs[0]);worldlinks.new(worldnodes.get('Background').outputs[0],mix.inputs[1]);worldlinks.new(background.outputs[0],mix.inputs[2]);worldlinks.new(mix.outputs[0],worldnodes.get('World Output').inputs['Surface'])
floor.hide_render=True
for name,loc,power,size in [('Key',(-.25,-.35,.40),3.2,.26),('Fill',(.26,-.15,.20),1.0,.25),('Rim',(.05,.18,.32),1.6,.22)]:
 bpy.ops.object.light_add(type='AREA',location=loc);light=stage(bpy.context.object);light.name='Studio '+name;light.data.energy=power;light.data.shape='DISK';light.data.size=size;light.rotation_euler=(Vector((0,0,.10))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add();camera=stage(bpy.context.object);camera.name='Reference comparison camera';camera.data.type='ORTHO';scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=True
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.film_transparent=False
scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=-.70
# Export only the requested player. The ball is also delivered separately and in a Hello bundle.
def export(name,objects):
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]
 bpy.ops.export_scene.gltf(filepath=str(HERE/name),export_format='GLB',use_selection=True,export_animations=False,export_yup=True,export_apply=True)
export('kawaii-player-v3.glb',[root,*[o for o in model.objects if o!=root]])
export('football.glb',ballparts)
export('hello-display.glb',[root,*[o for o in model.objects if o!=root],*ballparts])
bpy.context.view_layer.update()
points=[o.matrix_world@v.co for o in parts for v in o.data.vertices];lo=[min(p[i] for p in points) for i in range(3)];hi=[max(p[i] for p in points) for i in range(3)]
report={'asset':'ArenaVoca kawaii player v3','units':'metres','blender_front':'-Y','blender_up':'+Z','glb_front':'+Z','glb_up':'+Y','bounds_min':lo,'bounds_max':hi,'dimensions':[hi[i]-lo[i] for i in range(3)],'mesh_objects':len(parts),'triangles_authored':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in parts),'materials':len({m.name for o in parts for m in o.data.materials}),'pose':'Static reference-inspired Hello; raised left boot, waving left hand, tilted head','rig':'Named editable assemblies; no skeletal animation rig','exports':{'kawaii-player-v3.glb':'player only','football.glb':'separate football prop','hello-display.glb':'player and football, without plinth/studio/reference'},'not_verified':['IWSDK runtime compatibility','Quest performance','animation deformation','user visual approval']}
(HERE/'model-report.json').write_text(json.dumps(report,indent=2)+'\n')
clay=material('Inspection clay','#b5b1b0',.80)
def view(filename,pos,claymode=False,hero=False):
 camera.location=pos;camera.rotation_euler=(Vector((-.004,0,.088))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=.230 if hero else .275
 scene.render.resolution_x,scene.render.resolution_y=(1100,1400) if hero else (640,480)
 scene.render.resolution_percentage=100;scene.cycles.samples=96 if hero else 48
 scene.render.filepath=str(HERE/'previews'/filename)
 # Cycles material override provides an actual geometry-only check.
 scene.view_layers[0].material_override=clay if claymode else None
 bpy.ops.render.render(write_still=True);scene.view_layers[0].material_override=None
view('quarter.png',(.08,-.55,.20))
view('clay.png',(.08,-.55,.20),True)
if not opts.preview_only:
 for name,pos in [('front.png',(0,-.55,.105)),('back.png',(-.08,.55,.20)),('side.png',(.55,0,.12)),('top.png',(0,-.03,.65))]:view(name,pos)
 view('hero.png',(.055,-.55,.19),hero=True)
# Open directly into the actual comparison camera.
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.shading.type='MATERIAL';area.spaces.active.overlay.show_overlays=False
bpy.ops.object.select_all(action='DESELECT');root.select_set(True);bpy.context.view_layer.objects.active=root
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'kawaii-player-v3.blend'))
print('MODEL_REPORT '+json.dumps(report))
