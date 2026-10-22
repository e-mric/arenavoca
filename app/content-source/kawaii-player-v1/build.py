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
 'skin':('Skin | warm caramel','#ebb07c'), 'hair':('Hair | chocolate','#493129'),
 'hair2':('Hair | soft highlight','#553a30'), 'ink':('Face | cocoa','#302321'),
 'blush':('Cheeks | soft peach','#ee9d83'), 'blue':('Jersey | cobalt','#1646ed'),
 'coral':('Trim | coral','#ffad9f'), 'navy':('Shorts and boots | navy','#142352'),
 'cream':('Socks and cuffs | cream','#fffaf2')}.items()}
parts=[];owners={}
def add(o,bone='Torso'):
 for c in list(o.users_collection):c.objects.unlink(o)
 model.objects.link(o);parts.append(o);owners[o.name]=bone
 return o
# Compact continuous jersey with an intentional waist/shoulder profile.
add(loft('Jersey',[(0,0,.058,.018,.011),(0,0,.060,.021,.013),(0,0,.072,.022,.014),(0,0,.084,.026,.014),(0,0,.090,.025,.013),(0,0,.096,.017,.009),(0,0,.098,.010,.007)],mat['blue'],32))
add(loft('Shorts waist',[(0,0,.048,.019,.012),(0,0,.055,.021,.013),(0,0,.062,.020,.012)],mat['navy'],32))
for side,tag in [(-1,'Left'),(1,'Right')]:
 x=side*.0108
 add(loft(tag+' shorts leg',[(x,0,.043,.0108,.012),(x,0,.046,.012,.013),(x,0,.056,.011,.012)],mat['navy']))
 add(loft(tag+' leg',[(x,0,.023,.0071,.007),(x,0,.040,.0077,.0075),(x,0,.048,.008,.008)],mat['skin']),tag+'Leg')
 add(loft(tag+' sock',[(x,0,.018,.0072,.007),(x,0,.021,.0078,.0075),(x,0,.034,.0075,.0074),(x,0,.037,.0081,.0078)],mat['cream']),tag+'Leg')
 add(loft(tag+' sock rib',[(x,0,.035,.008,.0078),(x,0,.037,.0083,.008),(x,0,.038,.0078,.0076)],mat['cream']),tag+'Leg')
 add(softbox(tag+' boot upper',(x,-.006,.013),(.0115,.017,.0085),mat['navy'],.60,32,16),tag+'Leg')
 add(softbox(tag+' coral sole',(x,-.006,.006),(.0119,.0173,.0028),mat['coral'],.42,32,12),tag+'Leg')
 for j,(dx,dy) in enumerate([(-.006,-.016),(.006,-.016),(-.006,.003),(.006,.003)]):
  add(softbox(tag+' sole stud '+str(j),(x+dx,dy,.0025),(.0023,.0024,.0024),mat['coral'],.6,12,6),tag+'Leg')
 # Sleeves and arm flow share the same slope, avoiding spherical shoulder stacks.
 add(loft(tag+' sleeve',[(side*.033,0,.072,.0095,.010),(side*.032,0,.075,.0105,.011),(side*.027,0,.086,.012,.012),(side*.022,0,.090,.009,.010)],mat['blue']),tag+'Arm')
 add(loft(tag+' cream cuff',[(side*.034,0,.069,.0098,.0105),(side*.033,0,.072,.010,.0108),(side*.032,0,.074,.010,.0105)],mat['cream']),tag+'Arm')
 add(loft(tag+' forearm',[(side*.040,-.001,.054,.005,.006),(side*.039,-.001,.058,.0075,.0075),(side*.036,0,.067,.0078,.008),(side*.033,0,.074,.0075,.008)],mat['skin']),tag+'Arm')
 add(softbox(tag+' hand',(side*.041,-.001,.054),(.007,.007,.0085),mat['skin'],.8,24,12),tag+'Arm')
 add(ellipsoid(tag+' thumb',(side*.036,-.006,.056),(.0036,.0036,.0048),mat['skin'],16,10),tag+'Arm')
# Neck and round coral collar tuck beneath the head, not a shirt stripe.
add(ellipsoid('Neck',(0,0,.099),(.010,.009,.010),mat['skin']))
bpy.ops.mesh.primitive_torus_add(major_segments=40,minor_segments=8,location=(0,-.001,.098),major_radius=.010,minor_radius=.0018)
collar=bpy.context.object;collar.name='Coral round collar';collar.scale.y=.8;collar.data.materials.append(mat['coral']);add(collar)
# Fuller rounded-square head, softer chin: approximately 46% of total height.
HEAD=(0,0,.133);RAD=(.039,.031,.038);POWER=.8
add(softbox('Head sculpt',HEAD,RAD,mat['skin'],POWER,64,32),'Head')
for side,tag in [(-1,'Left'),(1,'Right')]:
 add(ellipsoid(tag+' ear',(side*.038,0,.132),(.0073,.0067,.0095),mat['skin']),'Head')
 add(ellipsoid(tag+' inner ear',(side*.041,-.0048,.132),(.0035,.0018,.005),mat['blush'],20,10),'Head')
def face_y(x,z):
 q=2/POWER;remain=max(.001,1-(abs(x)/RAD[0])**q-(abs(z-HEAD[2])/RAD[2])**q)
 return -RAD[1]*remain**(POWER/2)
for side,tag in [(-1,'Left'),(1,'Right')]:
 x=side*.0142;z=.133
 add(ellipsoid(tag+' dot eye',(x,face_y(x,z)-.00065,z),(.0028,.0011,.0041),mat['ink'],24,14),'Head')
 x=side*.024;z=.123
 cheek=add(ellipsoid(tag+' cheek',(x,face_y(x,z)-.00025,z),(.0055,.00045,.0027),mat['blush'],24,12),'Head')
 # Surface-relative orientation: local depth follows the rounded cheek normal.
 eps=.00001;dydx=(face_y(x+eps,z)-face_y(x-eps,z))/(2*eps)
 cheek.rotation_euler.z=-math.atan(dydx)
 x=side*.014;z=.144
 points=[(x+u,face_y(x+u,z+v)-.0008,z+v) for u,v in [(-.003,.0001),(0,.001),(.003,.0002)]]
 add(stroke(tag+' eyebrow',points,.00048,mat['hair']),'Head')
smile=[(-.0065,.121),(-.004,.1175),(0,.1168),(.004,.1178),(.0065,.1206)]
add(stroke('Happy smile',[(x,face_y(x,z)-.0008,z) for x,z in smile],.00070,mat['ink']),'Head')
# A thin scalp cap is derived from the head surface, with a shaped hairline.
verts=[];faces=[];segments=64;rows=18
for j in range(rows):
 for i in range(segments):
  theta=2*pi*i/segments;front=max(0,-sin(theta))
  low=-.56+.97*front+.18*abs(cos(theta));lat=low+(pi/2-low)*j/rows
  verts.append(((RAD[0]+.0018)*math.copysign(abs(cos(lat)*cos(theta))**POWER,cos(theta)),(RAD[1]+.0017)*math.copysign(abs(cos(lat)*sin(theta))**POWER,sin(theta)),HEAD[2]+(RAD[2]+.0020)*math.copysign(abs(sin(lat))**POWER,sin(lat))))
for j in range(rows-1):
 for i in range(segments):
  a=j*segments+i;b=j*segments+(i+1)%segments;faces.append((a,b,b+segments,a+segments))
top=len(verts);verts.append((0,0,HEAD[2]+RAD[2]+.002))
for i in range(segments):faces.append((top,(rows-1)*segments+i,(rows-1)*segments+(i+1)%segments))
cap=add(mesh('Hair cap',verts,faces,mat['hair']),'Head')
solid=cap.modifiers.new('Closed hairline edge','SOLIDIFY');solid.thickness=.0012
bpy.context.view_layer.objects.active=cap;bpy.ops.object.modifier_apply(modifier=solid.name)
hair=[
 ('Swept fringe main',[(-.033,-.010,.159),(-.021,-.033,.180),(.024,-.035,.179),(.023,-.033,.149)],[.001,.012,.011,.0006],[.001,.007,.006,.0006]),
 ('Swept fringe left',[(-.038,-.004,.145),(-.039,-.031,.162),(-.008,-.039,.171),(.007,-.035,.151)],[.001,.009,.010,.0007],[.001,.005,.005,.0007]),
 ('Crown swoop',[(-.028,.007,.167),(-.003,-.009,.185),(.033,-.020,.182),(.037,-.016,.153)],[.001,.013,.012,.0007],[.001,.007,.007,.0007]),
 ('Right temple curl',[(.034,.002,.157),(.042,-.013,.156),(.043,-.019,.148),(.037,-.018,.139)],[.001,.007,.007,.0006],[.001,.004,.004,.0006])]
for i,(name,points,widths,depths) in enumerate(hair):add(tuft(name,points,widths,depths,mat['hair2' if i==2 else 'hair']),'Head')
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
  rotate('RightArm',(0,1,0),-1.95);rotate('Head',(0,1,0),-.09)
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
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.009));floor=stage(bpy.context.object);floor.name='Studio floor';floor.data.materials.append(ivory)
scene.world=bpy.data.worlds.new('Ivory studio world');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.74,.68,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.45
for name,pos,power,size in [('Key',(-.3,-.4,.5),4,.35),('Fill',(.3,-.15,.25),1.5,.3),('Rim',(.1,.2,.4),3,.3)]:
 bpy.ops.object.light_add(type='AREA',location=pos);light=stage(bpy.context.object);light.name='Studio '+name;light.data.energy=power;light.data.shape='DISK';light.data.size=size
 light.rotation_euler=(Vector((0,0,.10))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(.22,-.46,.24));camera=stage(bpy.context.object);camera.name='Preview camera';camera.data.type='ORTHO';camera.data.ortho_scale=.30;scene.camera=camera
scene.render.engine='BLENDER_EEVEE';scene.render.image_settings.file_format='PNG'
scene.render.resolution_x=640;scene.render.resolution_y=480;scene.render.resolution_percentage=100
scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.render.film_transparent=False
scene.render.image_settings.color_mode='RGBA';scene.render.fps=24;scene.frame_start=1;scene.frame_end=1
# Portable model export: only geometry and rig; preview scenery is never selected.
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(HERE/'kawaii-player-v1.glb'),export_format='GLB',use_selection=True,export_animations=False,export_yup=True,export_apply=False)
# Useful semantic model measurements, evaluated before studio geometry is considered.
deps=bpy.context.evaluated_depsgraph_get();points=[o.evaluated_get(deps).matrix_world@Vector(p) for o in parts for p in o.evaluated_get(deps).bound_box]
lo=[min(p[i] for p in points) for i in range(3)];hi=[max(p[i] for p in points) for i in range(3)]
triangles=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in parts)
report={'asset':'ArenaVoca kawaii player v1','units':'metres','blender_front':'-Y','blender_up':'+Z','glb_front':'+Z','glb_up':'+Y','bounds_min':lo,'bounds_max':hi,'dimensions':[hi[i]-lo[i] for i in range(3)],'triangles_authored':triangles,'mesh_objects':len(parts),'materials':len(mat),'pose_samples':['Ready','Hello','Pass'],'exported_pose':'Ready','export_contains':'player geometry and 7-bone toy rig only','not_verified':['IWSDK runtime compatibility','Quest performance and reach','skin deformation under large rotations']}
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
view((.24,-.5,.23),'hello.png')
if not opts.preview_only:
 camera.data.ortho_scale=.255
 view((.24,-.5,.23),'hero.png',res=(1400,1400))
camera.location=(.24,-.5,.23);camera.rotation_euler=(Vector((0,0,.093))-camera.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='VIEW_3D':
   area.spaces.active.region_3d.view_distance=.30;area.spaces.active.region_3d.view_location=(0,0,.09)
   area.spaces.active.shading.type='MATERIAL';area.spaces.active.overlay.show_overlays=False
scene.render.resolution_x=scene.render.resolution_y=1400
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'kawaii-player-v1.blend'))
print('MODEL_REPORT '+json.dumps(report))
