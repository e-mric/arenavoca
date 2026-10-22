"""Build a lightweight articulated celebration derivative; preserve v3 unchanged."""
import bpy, sys, json, math, struct
from pathlib import Path
from mathutils import Matrix, Vector
sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'kawaii-player-v3'))
from forms import material, loft, ellipsoid, softbox
from sculpt import build_character, smooth, tube, span, finish
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
collection = bpy.data.collections.new('Original kawaii celebration derivative')
scene.collection.children.link(collection)
mat = {key: material(name, color, roughness) for key, name, color, roughness in [
 ('skin','Warm peach','#f3b47d',.72),('blush','Peach blush','#ef826e',.8),
 ('hair','Chocolate hair','#50362e',.58),('ink','Cocoa face','#302522',.52),
 ('brow','Soft brows','#986143',.75),('blue','Cobalt jersey','#1946ee',.68),
 ('navy','Navy shorts and boots','#202c59',.62),('coral','Coral trim','#ff9d88',.66),
 ('cream','Cream socks and cuffs','#fff4de',.8)]}
parts, groups = build_character(collection, mat)
def add(obj, group='Body'):
 for c in list(obj.users_collection): c.objects.unlink(obj)
 collection.objects.link(obj); parts.append(obj); groups[obj.name] = group
 return obj
for obj in list(parts):
 if obj.name == 'Jersey with rounded shoulder transitions' or groups[obj.name] == 'Raised leg':
  parts.remove(obj); groups.pop(obj.name); bpy.data.objects.remove(obj, do_unlink=True)
shirt = loft('Soft jersey torso',[(.002,0,.055,.019,.010),(.002,0,.057,.022,.012),
 (.001,0,.070,.020,.013),(0,0,.085,.022,.013),(-.001,0,.092,.024,.012),
 (0,0,.096,.016,.009),(0,0,.098,.010,.008)],mat['blue'],32)
add(smooth(shirt))
add(tube('Left rounded sleeve',(-.020,0,.090),(-.032,-.001,.098),.012,.010,mat['blue']),'Wave arm')
add(tube('Right rounded sleeve',(.020,0,.089),(.032,0,.077),.011,.0095,mat['blue']),'Lower arm')
groups['Wave cream cuff'] = 'Wave arm'; groups['Lower cream cuff'] = 'Lower arm'
add(span('Left knee',(-.013,0,.049),(-.013,0,.031),(.008,.008),mat['skin']),'Raised leg')
add(tube('Left sock',(-.013,0,.015),(-.013,0,.031),.0075,.008,mat['cream']),'Raised leg')
add(softbox('Left boot',(-.013,-.005,.011),(.012,.017,.009),mat['navy'],.84,32,20),'Raised leg')
add(softbox('Left sole',(-.013,-.005,.003),(.0125,.0175,.002),mat['coral'],.72,32,16),'Raised leg')
for i,(dx,dy) in enumerate([(-.006,-.010),(.006,-.010),(-.006,.009),(.006,.009)]):
 add(ellipsoid('Left stud '+str(i),(-.013+dx,-.005+dy,.001),(.0025,.0025,.0015),mat['coral'],12,8),'Raised leg')
# Independent sleeves/cuffs/hands rotate at overlapping rounded shoulder joints.
root = bpy.data.objects.new('KawaiiCelebration',None); collection.objects.link(root)
pivots = {}
for name, location in [('Wave arm',(-.020,0,.090)),('Lower arm',(.020,0,.089)),('Head',(0,0,.102))]:
 pivot = bpy.data.objects.new({'Wave arm':'CelebrateLeftArm','Lower arm':'CelebrateRightArm','Head':'CelebrateHead'}[name],None)
 collection.objects.link(pivot); pivot.parent=root; pivot.location=location; pivots[name]=pivot
for obj in parts:
 bpy.context.view_layer.objects.active = obj
 if len(obj.data.polygons) > 220:
  mod=obj.modifiers.new('Runtime silhouette reduction','DECIMATE');mod.ratio=.30
  bpy.ops.object.modifier_apply(modifier=mod.name)
 finish(obj)
 world = obj.matrix_world.copy(); obj.parent=pivots.get(groups[obj.name],root)
 obj.matrix_world=world
bpy.context.view_layer.update()
for used in bpy.data.materials:
 used.use_backface_culling = True
img=bpy.data.images.load(str(HERE.parent/'kawaii-player-v3/approved-concept.png'));img.pack()
bpy.ops.object.select_all(action='DESELECT')
for obj in collection.objects:obj.select_set(True)
bpy.context.view_layer.objects.active=root
out=HERE.parent.parent/'public/models/celebration/kawaii-player.glb';out.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,export_animations=False,export_yup=True,export_apply=True)
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'kawaii-celebration.blend'))
raw=out.read_bytes();size,kind=struct.unpack_from('<II',raw,12);data=json.loads(raw[20:20+size])
assert kind==0x4e4f534a and not data.get('animations') and not data.get('cameras')
assert all(math.isfinite(x) for obj in parts for v in obj.data.vertices for x in v.co)
assert all(p.area>1e-14 for obj in parts for p in obj.data.polygons)
triangles=sum(data['accessors'][p['indices']]['count']//3 for mesh in data['meshes'] for p in mesh['primitives'])
assert triangles < 40000
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(out))
assert all(bpy.data.objects.get(name) for name in ['CelebrateLeftArm','CelebrateRightArm','CelebrateHead'])
report={'passed':True,'triangles':triangles,'bytes':len(raw),'meshes':len(data['meshes']),
 'articulation':'rigid shoulder/head pivots, not skin deformation',
 'source':'Original v3 sculpture; standing legs and independent sleeves; no ball/studio exported',
 'scope':'Blender geometry and fresh GLB import; runtime and Quest acceptance separate'}
(HERE/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
print('CELEBRATION_ASSET '+json.dumps(report))
