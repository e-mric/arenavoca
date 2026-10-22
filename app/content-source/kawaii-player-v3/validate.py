"""Verify reopened source, outward closed hair, export contents and GLB roundtrips."""
import bpy,bmesh,json,math,struct,hashlib
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'kawaii-player-v3.blend'))
model=bpy.data.collections['PLAYER | original v3 editable sculpture']
parts=[o for o in model.objects if o.type=='MESH'];source_names=sorted(o.name for o in parts)
assert len(parts)==40
assert any(img.packed_file for img in bpy.data.images if img.name.startswith('approved-concept'))
assert hashlib.sha256((HERE/'approved-concept.png').read_bytes()).digest()==hashlib.sha256((HERE.parent/'kawaii-player-v2/approved-concept.png').read_bytes()).digest()
assert all(math.isfinite(x) for o in parts for v in o.data.vertices for x in v.co)
assert all(o.data.materials and all(o.data.materials) for o in parts)
assert all(p.area>1e-14 for o in parts for p in o.data.polygons), 'Degenerate polygon'
assert all(p.use_smooth for o in parts for p in o.data.polygons)
head=bpy.data.objects['Head sculpt'];assert 'FaceTint' in head.data.color_attributes
assert max(c.color[0] for c in head.data.color_attributes['FaceTint'].data)-min(c.color[0] for c in head.data.color_attributes['FaceTint'].data)>.01
hair=[]
for o in parts:
 if any(word in o.name.lower() for word in ['lock','sweep','fringe','flow','hair cap']):
  bm=bmesh.new();bm.from_mesh(o.data)
  assert all(e.is_manifold for e in bm.edges),o.name+' hair is not a closed manifold'
  volume=bm.calc_volume(signed=True);assert volume>0,o.name+' hair normals face inward'
  hair.append({'name':o.name,'closed_manifold':True,'positive_signed_volume':volume});bm.free()
assert len(hair)==8
# Check compact density after silhouette-preserving reduction.
triangles=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in parts);assert triangles<100000
bpy.context.view_layer.update()
points=[o.matrix_world@v.co for o in parts for v in o.data.vertices]
lo=[min(p[i] for p in points) for i in range(3)];hi=[max(p[i] for p in points) for i in range(3)]
standing=bpy.data.objects['Standing coral sole'];ballparts=[o for o in bpy.data.collections['FOOTBALL | separate portable prop'].objects if o.type=='MESH']
assert abs(min((o.matrix_world@v.co).z for o in parts for v in o.data.vertices)+.0005)<1e-5
# The foot sole and football intentionally overlap by half a millimetre at the top contact.
raised=bpy.data.objects['Raised coral sole'];sole_bottom=min((raised.matrix_world@v.co).z for v in raised.data.vertices)
ball_top=max((o.matrix_world@v.co).z for o in ballparts for v in o.data.vertices)
assert -.001<sole_bottom-ball_top<.0005,(sole_bottom,ball_top)
results=[]
for filename,expected in [('kawaii-player-v3.glb',40),('football.glb',2),('hello-display.glb',42)]:
 raw=(HERE/filename).read_bytes();magic,version,length=struct.unpack_from('<4sII',raw);assert magic==b'glTF' and version==2 and length==len(raw)
 size,kind=struct.unpack_from('<II',raw,12);assert kind==0x4e4f534a;j=json.loads(raw[20:20+size])
 assert not j.get('cameras') and not j.get('images') and not j.get('animations') and not j.get('skins')
 assert all(not any(t in n.get('name','').lower() for t in ['studio','preview','plinth','reference','concept']) for n in j['nodes'])
 for m in j['meshes']:
  for p in m['primitives']:assert {'POSITION','NORMAL'}.issubset(p['attributes']) and p.get('mode',4)==4
 if filename!='football.glb':
  hn=next(n for n in j['nodes'] if n.get('name')=='Head sculpt')
  assert all('COLOR_0' in p['attributes'] for p in j['meshes'][hn['mesh']]['primitives'])
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(HERE/filename));bpy.context.view_layer.update()
 imported=[o for o in bpy.context.scene.objects if o.type=='MESH'];assert len(imported)==expected,(filename,len(imported))
 if filename=='kawaii-player-v3.glb':
  assert sorted(o.name for o in imported)==source_names
  pts=[o.matrix_world@v.co for o in imported for v in o.data.vertices]
  assert all(abs(min(p[i] for p in pts)-lo[i])<1e-6 and abs(max(p[i] for p in pts)-hi[i])<1e-6 for i in range(3))
 results.append({'file':filename,'reimported':True,'meshes':len(imported),'triangles':sum(j['accessors'][p['indices']]['count']//3 for m in j['meshes'] for p in m['primitives']),'bytes':len(raw)})
result={'passed':True,'source_reopened':True,'unchanged_reference_packed':True,'finite_geometry_and_nonzero_faces':True,'outward_closed_hair':hair,'painted_blush_exported':True,'player_bounds_preserved_on_reimport':True,'actual_vertex_bounds_min':lo,'actual_vertex_bounds_max':hi,'football_sole_contact_delta_m':sole_bottom-ball_top,'roundtrips':results,'scope':'Saved Blender and GLB assets only. No animation, runtime, headset or performance acceptance.'}
(HERE/'validation.json').write_text(json.dumps(result,indent=2)+'\n');print('VALIDATION '+json.dumps(result))
