"""Build the original ArenaVoca kawaii footballer in Blender, without external assets."""
import bpy, math, sys, json, argparse
sys.dont_write_bytecode=True
from pathlib import Path
from mathutils import Vector
from math import sin,cos,pi
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from forms import material,ellipsoid,softbox,loft,stroke,tuft,bevelbox,mesh
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
parser=argparse.ArgumentParser();parser.add_argument('--preview-only',action='store_true');opts=parser.parse_args(args)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version=0
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
model=bpy.data.collections.new('PLAYER | original editable geometry');scene.collection.children.link(model)
mat={k:material(*v) for k,v in {
 'skin':('Skin | warm caramel','#efb17d'), 'hair':('Hair | chocolate','#493129'),
 'hair2':('Hair | soft highlight','#553a30'), 'ink':('Face | cocoa','#302321'),
 'blush':('Cheeks | soft peach','#ee9d83'), 'blue':('Jersey | cobalt','#1646ed'),
 'coral':('Trim | coral','#ffad9f'), 'navy':('Shorts and boots | navy','#142352'),
 'cream':('Socks and cuffs | cream','#fffaf2')}.items()}
parts=[];owners={}
def add(o,bone='Torso'):
 for c in list(o.users_collection):c.objects.unlink(o)
 model.objects.link(o);parts.append(o);owners[o.name]=bone
 return o
from sculpt import build_character
parts,owners=build_character(model,mat)
# Lightweight rigid toy rig: named parts, editable pivots, and two pose samples.
bpy.ops.object.select_all(action='DESELECT')
rigdata=bpy.data.armatures.new('Kawaii player pose controls');rig=bpy.data.objects.new('ArenaVoca_Kawaii_Player',rigdata);model.objects.link(rig)
bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
bones=[('Root',(0,0,0),(0,0,.035),None),('Torso',(0,0,.050),(0,0,.100),'Root'),('Head',(0,0,.098),(0,0,.160),'Torso')]
for side,tag in [(-1,'Left'),(1,'Right')]:
 bones.extend([(tag+'Arm',(side*.024,0,.085),(side*.041,0,.054),'Torso'),(tag+'Leg',(side*.011,0,.052),(side*.011,0,.017),'Root')])
for name,start,end,parent in bones:
 b=rigdata.edit_bones.new(name);b.head=start;b.tail=end
 if parent:b.parent=rigdata.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT');rig.show_in_front=True;rig.data.display_type='STICK'
for o in parts:
 for polygon in o.data.polygons:polygon.use_smooth=True
 bone=owners[o.name];vg=o.vertex_groups.new(name=bone);vg.add(list(range(len(o.data.vertices))),1,'REPLACE')
 modifier=o.modifiers.new('Editable toy pose','ARMATURE');modifier.object=rig;o.parent=rig
# Rotate in world/model space, accounting for each bone's rest orientation.
def reset_pose():
 for p in rig.pose.bones:p.rotation_mode='QUATERNION';p.rotation_quaternion=(1,0,0,0)
def rotate(name,axis,angle):
 from mathutils import Quaternion
 p=rig.pose.bones[name];basis=p.bone.matrix_local.to_quaternion()
 p.rotation_quaternion=basis.inverted()@Quaternion(axis,angle)@basis
reset_pose()
for name in ['Ready','Hello','Pass']:
 rig.animation_data_create();rig.animation_data.action=bpy.data.actions.new(name);reset_pose()
 if name=='Hello':
  rotate('LeftArm',(0,1,0),1.80);rotate('Head',(0,1,0),.22);rotate('RightArm',(0,1,0),-.12)
 if name=='Pass':
  rotate('RightLeg',(1,0,0),-.55);rotate('LeftArm',(0,1,0),.20);rotate('RightArm',(0,1,0),-.22);rotate('Head',(1,0,0),.10)
 for p in rig.pose.bones:p.keyframe_insert(data_path='rotation_quaternion',frame=1,group=p.name)
 rig.animation_data.action.use_fake_user=True
rig.animation_data.action=None;reset_pose()
rig['design_status']='Original Blender model based on the user-approved kawaii image concept, 17 October 2026; visual review candidate.'
rig['coordinates']='metres; Blender Z up, -Y front; GLB Y up, +Z front; sole plane z=0'
rig['rig_limits']='Rigid toy limbs, one influence per vertex. Ready/Hello/Pass are static pose samples, not finished animation clips.'
# Keep the approved reference in the editable file, outside the exported collection.
references=bpy.data.collections.new('REFERENCE | approved image, not exported');scene.collection.children.link(references)
refimage=bpy.data.images.load(str(HERE/'approved-concept.png'));refimage.pack()
ref=bpy.data.objects.new('Approved kawaii concept',None);ref.empty_display_type='IMAGE';ref.data=refimage
ref.empty_display_size=.30;ref.location=(.25,.10,.12);ref.rotation_euler=(pi/2,0,0);ref.hide_render=True;references.objects.link(ref);references.hide_viewport=True
# Studio is presentation only. It is deliberately excluded from the GLB export.
studio=bpy.data.collections.new('STUDIO | preview only, not exported');scene.collection.children.link(studio)
def stage(o):
 for c in list(o.users_collection):c.objects.unlink(o)
 studio.objects.link(o);return o
lavender=material('Studio | lavender','#ddd8ff');ivory=material('Studio | ivory','#fffaf2')
bpy.ops.mesh.primitive_cylinder_add(vertices=96,radius=.067,depth=.008,location=(0,0,-.0045))
plinth=stage(bpy.context.object);plinth.name='Preview plinth (not exported)';plinth.data.materials.append(lavender)
mod=plinth.modifiers.new('Soft rim','BEVEL');mod.width=.002;mod.segments=4;bpy.context.view_layer.objects.active=plinth;bpy.ops.object.modifier_apply(modifier=mod.name)
for p in plinth.data.polygons:p.use_smooth=True
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.009));floor=stage(bpy.context.object);floor.name='Studio floor';floor.data.materials.append(ivory);floor.hide_render=True
scene.world=bpy.data.worlds.new('Ivory studio world');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.74,.68,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
# Camera sees a flat ivory backdrop; lighting remains separate and neutral.
wn=scene.world.node_tree.nodes;wl=scene.world.node_tree.links
ambient=wn.get('Background');backdrop=wn.new('ShaderNodeBackground')
backdrop.inputs[0].default_value=ivory.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value
backdrop.inputs[1].default_value=2**.25
path=wn.new('ShaderNodeLightPath');mix=wn.new('ShaderNodeMixShader')
wl.new(path.outputs['Is Camera Ray'],mix.inputs[0]);wl.new(ambient.outputs[0],mix.inputs[1]);wl.new(backdrop.outputs[0],mix.inputs[2]);wl.new(mix.outputs[0],wn.get('World Output').inputs['Surface'])
for name,pos,power,size in [('Key',(-.3,-.4,.5),3,.4),('Fill',(.3,-.15,.25),1,.35),('Rim',(.1,.2,.4),1,.35)]:
 bpy.ops.object.light_add(type='AREA',location=pos);light=stage(bpy.context.object);light.name='Studio '+name;light.data.energy=power;light.data.shape='DISK';light.data.size=size
 light.rotation_euler=(Vector((0,0,.10))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(.22,-.46,.24));camera=stage(bpy.context.object);camera.name='Preview camera';camera.data.type='ORTHO';camera.data.ortho_scale=.30;scene.camera=camera
scene.render.engine='BLENDER_EEVEE';scene.render.image_settings.file_format='PNG'
scene.render.resolution_x=640;scene.render.resolution_y=480;scene.render.resolution_percentage=100
scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=-.25;scene.render.film_transparent=False
scene.render.image_settings.color_mode='RGBA';scene.render.fps=24;scene.frame_start=1;scene.frame_end=1
# Portable model export: only geometry and rig; preview scenery is never selected.
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(HERE/'kawaii-player-v2.glb'),export_format='GLB',use_selection=True,export_animations=False,export_yup=True,export_apply=False)
# Useful semantic model measurements, evaluated before studio geometry is considered.
deps=bpy.context.evaluated_depsgraph_get();points=[o.evaluated_get(deps).matrix_world@Vector(p) for o in parts for p in o.evaluated_get(deps).bound_box]
lo=[min(p[i] for p in points) for i in range(3)];hi=[max(p[i] for p in points) for i in range(3)]
triangles=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in parts)
report={'asset':'ArenaVoca kawaii player v2','units':'metres','blender_front':'-Y','blender_up':'+Z','glb_front':'+Z','glb_up':'+Y','bounds_min':lo,'bounds_max':hi,'dimensions':[hi[i]-lo[i] for i in range(3)],'triangles_authored':triangles,'mesh_objects':len(parts),'materials':len(mat),'pose_samples':['Ready','Hello','Pass'],'exported_pose':'Ready','export_contains':'player geometry and 7-bone toy rig only','not_verified':['IWSDK runtime compatibility','Quest performance and reach','skin deformation under large rotations']}
(HERE/'model-report.json').write_text(json.dumps(report,indent=2)+'\n')
# Render compact canonical views for one bounded geometry/material review.
def view(pos,filename,clay=False,res=(640,480)):
 camera.location=pos;camera.rotation_euler=(Vector((0,0,.093))-camera.location).to_track_quat('-Z','Y').to_euler()
 scene.render.resolution_x,scene.render.resolution_y=res
 scene.render.filepath=str(HERE/'previews'/filename)
 if clay:scene.view_layers[0].material_override=material('Inspection clay','#b7b2b0')
 bpy.ops.render.render(write_still=True)
 scene.view_layers[0].material_override=None
views=[('front.png',(0,-.5,.17)),('quarter.png',(.26,-.48,.24)),('back.png',(-.24,.48,.22)),('clay.png',(.26,-.48,.24))]
for filename,pos in views:view(pos,filename,filename=='clay.png')
# Save the actual Blender source with the inviting Hello pose, but export stays Ready.
rig.animation_data.action=bpy.data.actions.get('Hello');scene.frame_set(1)
view((.13,-.5,.19),'hello.png')
if not opts.preview_only:
 camera.data.ortho_scale=.235
 view((.13,-.5,.19),'hero.png',res=(1200,1400))
camera.location=(.13,-.5,.19);camera.rotation_euler=(Vector((0,0,.093))-camera.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='VIEW_3D':
   area.spaces.active.region_3d.view_distance=.30;area.spaces.active.region_3d.view_location=(0,0,.09)
   area.spaces.active.shading.type='MATERIAL';area.spaces.active.overlay.show_overlays=False
scene.render.resolution_x=1200;scene.render.resolution_y=1400
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'kawaii-player-v2.blend'))
print('MODEL_REPORT '+json.dumps(report))
