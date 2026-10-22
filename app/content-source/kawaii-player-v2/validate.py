"""Check the saved Blender source and reimported portable export in fresh Blender."""
import bpy,json,math,struct
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'kawaii-player-v2.blend'))
model=bpy.data.collections['PLAYER | original editable geometry']
rig=bpy.data.objects['ArenaVoca_Kawaii_Player']
assert rig.type=='ARMATURE' and len(rig.data.bones)==7
assert {'Ready','Hello','Pass'}.issubset(set(bpy.data.actions.keys()))
assert any(i.packed_file for i in bpy.data.images if i.name.startswith('approved-concept'))
rig.animation_data.action=bpy.data.actions['Ready'];bpy.context.scene.frame_set(1)
parts=[o for o in model.objects if o.type=='MESH']
assert len(parts)>0
assert not any('cheek' in o.name.lower() for o in parts), 'Blush must be painted, not raised cheek geometry'
head=bpy.data.objects['Head sculpt'];assert 'FaceTint' in head.data.color_attributes
assert max(max(c.color[k] for c in head.data.color_attributes['FaceTint'].data)-min(c.color[k] for c in head.data.color_attributes['FaceTint'].data) for k in range(3))>.02
source_names=sorted(o.name for o in parts)
for o in parts:
 assert o.data.materials and all(o.data.materials),o.name
 assert any(m.type=='ARMATURE' and m.object==rig for m in o.modifiers),o.name
 assert all(math.isfinite(v) for vertex in o.data.vertices for v in vertex.co),o.name
 assert all(p.area>1e-14 for p in o.data.polygons),o.name+' zero area'
 assert all(p.use_smooth for p in o.data.polygons),o.name
raw=(HERE/'kawaii-player-v2.glb').read_bytes()
magic,version,length=struct.unpack_from('<4sII',raw)
assert magic==b'glTF' and version==2 and length==len(raw)
size,chunk=struct.unpack_from('<II',raw,12);assert chunk==0x4e4f534a
j=json.loads(raw[20:20+size]);assert not j.get('cameras') and not j.get('images') and not j.get('animations')
assert len(j.get('skins',[]))==1 and len(j['skins'][0]['joints'])==7
assert all('Studio' not in n.get('name','') and 'Preview' not in n.get('name','') and 'concept' not in n.get('name','') for n in j.get('nodes',[]))
head_node=next(n for n in j['nodes'] if n.get('name')=='Head sculpt')
assert all('COLOR_0' in p['attributes'] for p in j['meshes'][head_node['mesh']]['primitives']), 'Painted blush missing in GLB'
for mesh in j['meshes']:
 for primitive in mesh['primitives']:
  assert {'POSITION','NORMAL','JOINTS_0','WEIGHTS_0'}.issubset(primitive['attributes']),mesh['name']
  assert primitive.get('mode',4)==4
export_triangles=sum(j['accessors'][p['indices']]['count']//3 for m in j['meshes'] for p in m['primitives'])
assert export_triangles<70000
# Fresh import catches corrupt or unsupported exports, not just a valid JSON header.
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(HERE/'kawaii-player-v2.glb'))
# Blender creates a non-exported Icosphere as its bone-control display shape.
control_shapes={p.custom_shape for o in bpy.context.scene.objects if o.type=='ARMATURE' for p in o.pose.bones if p.custom_shape}
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and o not in control_shapes]
assert sorted(o.name for o in meshes)==source_names,sorted(o.name for o in meshes)
points=[o.matrix_world@Vector(corner) for o in meshes for corner in o.bound_box]
lo=[min(p[i] for p in points) for i in range(3)];hi=[max(p[i] for p in points) for i in range(3)]
original=json.loads((HERE/'model-report.json').read_text())
assert all(abs(lo[i]-original['bounds_min'][i])<1e-5 and abs(hi[i]-original['bounds_max'][i])<1e-5 for i in range(3)),(lo,hi)
result={'passed':True,'painted_blush_preserved':True,'no_raised_cheek_meshes':True,'source_reopened':True,'reference_packed':True,'finite_geometry_and_nonzero_faces':True,'portable_export_reimported':True,'rest_bounds_preserved':True,'exported_triangles':export_triangles,'export_bytes':len(raw),'exported_meshes':len(meshes),'rig_bones':7,'exported_materials':len(j['materials']),'excluded_from_export':['studio','reference','pose animations'],'scope':'Blender source and GLB roundtrip only; no IWSDK or physical Quest acceptance'}
(HERE/'validation.json').write_text(json.dumps(result,indent=2)+'\n');print('VALIDATION '+json.dumps(result))
