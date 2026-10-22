"""Original v3 sculpt: continuous toy forms in a fixed, editable Hello pose."""
import bpy, math
from math import sin, cos, pi
from mathutils import Vector, Matrix
from forms import mesh, ellipsoid, softbox, loft, stroke

def finish(o):
 bpy.context.view_layer.objects.active=o
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True)
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
 for p in o.data.polygons:p.use_smooth=True
 o.select_set(False);return o

def fuse(name,objects,voxel=.00065):
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=objects[0];o.name=name
 mod=o.modifiers.new('Continuous sculpt union','REMESH');mod.mode='VOXEL';mod.voxel_size=voxel;bpy.ops.object.modifier_apply(modifier=mod.name)
 mod=o.modifiers.new('Soft sculpt finish','SMOOTH');mod.factor=1;mod.iterations=5;bpy.ops.object.modifier_apply(modifier=mod.name)
 mod=o.modifiers.new('Reduce sculpt density without changing silhouette','DECIMATE');mod.ratio=.42;bpy.ops.object.modifier_apply(modifier=mod.name)
 return finish(o)

def smooth(o,level=1):
 bpy.context.view_layer.objects.active=o
 mod=o.modifiers.new('Rounded subdivision','SUBSURF');mod.levels=level;bpy.ops.object.modifier_apply(modifier=mod.name)
 return finish(o)

def span(name,a,b,radii,mat):
 a,b=Vector(a),Vector(b);o=ellipsoid(name,(a+b)/2,(*radii,(b-a).length/2+min(radii)*.5),mat,32,20)
 o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o

def tube(name,a,b,r0,r1,mat):
 # Closed rounded sleeve/cuff along its own axis; end support rings preserve thickness.
 a,b=Vector(a),Vector(b);d=(b-a).length
 rings=[(0,0,-.001,r0*.88,r0*.88),(0,0,0,r0,r0),(0,0,d,r1,r1),(0,0,d+.001,r1*.88,r1*.88)]
 o=smooth(loft(name,rings,mat,32));o.location=a;o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o

def lock(name,points,width,depth,mat):
 # Cubic centreline with smooth elliptical profile and closed, rounded poles.
 pts=[Vector(p) for p in points];verts=[tuple(pts[0])];faces=[];steps=44;sides=24
 for j in range(1,steps):
  t=j/steps;u=1-t;p=u**3*pts[0]+3*u*u*t*pts[1]+3*u*t*t*pts[2]+t**3*pts[3]
  tangent=(3*u*u*(pts[1]-pts[0])+6*u*t*(pts[2]-pts[1])+3*t*t*(pts[3]-pts[2])).normalized()
  across=Vector((0,-1,.05)).cross(tangent).normalized();normal=tangent.cross(across).normalized()
  profile=sin(pi*t)**.56*(1-.12*t)
  for i in range(sides):
   theta=2*pi*i/sides;verts.append(tuple(p+profile*(across*cos(theta)*width+normal*sin(theta)*depth)))
 for i in range(sides):faces.append((0,1+(i+1)%sides,1+i))
 for j in range(steps-2):
  for i in range(sides):
   a=1+j*sides+i;b=1+j*sides+(i+1)%sides;faces.append((a,b,b+sides,a+sides))
 top=len(verts);verts.append(tuple(pts[-1]))
 for i in range(sides):faces.append((top,1+(steps-2)*sides+i,1+(steps-2)*sides+(i+1)%sides))
 # Compress only the exterior envelope toward the scalp using a smooth radial
 # falloff. This preserves rounded lock sections while preventing rear/crown
 # controls from creating unsupported spikes in side and top views.
 fitted=[];center=Vector((0,0,.135));radii=(.040,.031,.037);q=2/.85
 for point in verts:
  delta=Vector(point)-center;level=sum(abs(delta[i]/radii[i])**q for i in range(3))**(1/q)
  if level>1:delta*= (1+.23*math.tanh((level-1)/.23))/level
  fitted.append(tuple(center+delta))
 return finish(mesh(name,fitted,faces,mat))

def build_character(collection,mat):
 parts=[];groups={}
 def add(o,group='Body'):
  for c in list(o.users_collection):c.objects.unlink(o)
  collection.objects.link(o);parts.append(o);groups[o.name]=group;return o
 shirt=loft('Jersey core',[(.002,0,.055,.019,.010),(.002,0,.057,.022,.012),(.001,0,.070,.020,.013),(0,0,.085,.022,.013),(-.001,0,.092,.024,.012),(0,0,.096,.016,.009),(0,0,.098,.010,.008)],mat['blue'],40)
 sleeves=[tube('Wave sleeve',(-.020,0,.090),(-.032,-.001,.098),.012,.010,mat['blue']),tube('Lower sleeve',(.020,0,.089),(.032,0,.077),.011,.0095,mat['blue'])]
 add(fuse('Jersey with rounded shoulder transitions',[smooth(shirt),*sleeves],.00065))
 add(tube('Wave cream cuff',(-.031,-.001,.0975),(-.035,-.001,.101),.0101,.0098,mat['cream']))
 add(tube('Lower cream cuff',(.031,0,.078),(.034,0,.074),.0097,.0092,mat['cream']))
 add(ellipsoid('Neck',(0,-.004,.099),(.010,.010,.008),mat['skin']))
 add(stroke('Coral crew neck',[(-.011,-.0075,.097),(-.008,-.0105,.094),(0,-.0125,.093),(.008,-.0105,.094),(.011,-.0075,.097)],.0015,mat['coral']))
 # Rounded shorts with two deliberately angled openings around the raised thigh.
 shorts=[softbox('Shorts seat',(.002,.001,.053),(.021,.013,.009),mat['navy'],.86,40,24),span('Raised shorts leg',(-.008,0,.054),(-.016,-.004,.049),(.012,.012),mat['navy']),span('Standing shorts leg',(.013,0,.052),(.015,0,.045),(.011,.011),mat['navy'])]
 add(fuse('Soft shorts with asymmetric hems',shorts,.00065))
 # Wave: visibly connected forearm, palm and soft finger lobes.
 arm=[span('Wave forearm',(-.034,-.001,.101),(-.046,-.003,.111),(.0075,.0065),mat['skin']),ellipsoid('Wave palm',(-.048,-.003,.114),(.008,.0055,.0075),mat['skin'],32,20)]
 for i,(x,z) in enumerate([(-.054,.117),(-.052,.121),(-.048,.122)]):arm.append(ellipsoid('Wave finger '+str(i),(x,-.003,z),(.0032,.0042,.004),mat['skin'],24,16))
 arm.append(ellipsoid('Wave thumb',(-.040,-.004,.116),(.0034,.004,.005),mat['skin'],24,16))
 add(fuse('Waving arm and open mitten hand',arm,.0005),'Wave arm')
 low=[span('Lower forearm',(.034,0,.075),(.040,-.002,.062),(.0065,.006),mat['skin']),ellipsoid('Lower palm',(.042,-.002,.059),(.0065,.0055,.008),mat['skin'],32,20),ellipsoid('Lower thumb',(.037,-.006,.060),(.003,.0035,.0045),mat['skin'],24,16)]
 add(fuse('Lower arm and soft hand',low,.00055),'Lower arm')
 # The raised leg bends forward. Its boot sole rests at football top z=.032.
 for tag,a,b in [('Standing',(.015,0,.046),(.015,0,.031)),('Raised',(-.016,-.003,.057),(-.024,-.011,.052))]:
  add(span(tag+' knee',a,b,(.008,.008),mat['skin']),tag+' leg')
 add(tube('Standing sock',(.015,0,.015),(.015,0,.031),.0075,.008,mat['cream']),'Standing leg')
 add(tube('Raised sock',(-.026,-.015,.043),(-.023,-.010,.052),.008,.0082,mat['cream']),'Raised leg')
 for tag,x,y,sole in [('Standing',.015,-.005,.003),('Raised',-.027,-.019,.033)]:
  add(softbox(tag+' rounded boot',(x,y,sole+(.007 if tag=='Raised' else .008)),(.012,.017,.0075 if tag=='Raised' else .009),mat['navy'],.84,40,24),tag+' leg')
  add(softbox(tag+' coral sole',(x,y,sole),(.0125,.0175,.002),mat['coral'],.72,40,16),tag+' leg')
  for i,(dx,dy) in enumerate([(-.006,-.010),(.006,-.010),(-.006,.009),(.006,.009)]):add(ellipsoid(tag+' stud '+str(i),(x+dx,y+dy,sole-.002),(.0025,.0025,.0015),mat['coral'],16,10),tag+' leg')
 HEAD=(0,0,.135);RAD=(.040,.031,.037);POWER=.85
 head=add(softbox('Head sculpt',HEAD,RAD,mat['skin'],POWER,96,48),'Head')
 face=mat['skin'].copy();face.name='Skin with flush painted peach cheeks';mat['face']=face;head.data.materials.clear();head.data.materials.append(face)
 colors=head.data.color_attributes.new(name='FaceTint',type='FLOAT_COLOR',domain='POINT')
 base=mat['skin'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value
 blush=mat['blush'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value
 for v in head.data.vertices:
  x,y,z=v.co;amount=max(math.exp(-((x-s*.025)/.007)**2-((z-.123)/.0048)**2) for s in [-1,1])*.72*max(0,min(1,(-y-.012)/.010))
  colors.data[v.index].color=tuple(base[k]*(1-amount)+blush[k]*amount for k in range(3))+(1,)
 node=face.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='FaceTint';face.node_tree.links.new(node.outputs['Color'],face.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
 def front(x,z):
  q=2/POWER;return -RAD[1]*max(.0001,1-(abs(x)/RAD[0])**q-(abs(z-HEAD[2])/RAD[2])**q)**(POWER/2)
 for s,tag in [(-1,'Left'),(1,'Right')]:
  ear=add(ellipsoid(tag+' soft ear',(s*.039,.0005,.128),(.007,.006,.009),mat['skin'],40,24),'Head')
  x=s*.017;z=.133
  eye=add(ellipsoid(tag+' large friendly eye',(x,front(x,z)-.0005,z),(.00365,.0011,.0053),mat['ink'],40,24),'Head')
  eps=.0001;eye.rotation_euler.z=math.atan((front(x+eps,z)-front(x-eps,z))/(2*eps))
  brow=[(x+u,.146+v) for u,v in [(-.0028,0),(0,.0010),(.0028,0)]]
  add(stroke(tag+' soft eyebrow',[(xx,front(xx,zz)-.0006,zz) for xx,zz in brow],.00045,mat['brow']),'Head')
 smile=[(-.0056,.123),(-.004,.1205),(0,.1195),(.004,.1205),(.0056,.123)]
 add(stroke('Friendly smile',[(x,front(x,z)-.0006,z) for x,z in smile],.00065,mat['ink']),'Head')
 # Scalp hugs the skull. Broad smooth locks overlap it, never a floating stack.
 verts=[];faces=[];segments=80;rows=24
 for j in range(rows):
  for i in range(segments):
   th=2*pi*i/segments;frontward=max(0,-sin(th));low=-.65+1.30*frontward+.25*abs(cos(th));lat=low+(pi/2-low)*j/rows
   verts.append(((RAD[0]+.0016)*math.copysign(abs(cos(lat)*cos(th))**POWER,cos(th)),(RAD[1]+.0016)*math.copysign(abs(cos(lat)*sin(th))**POWER,sin(th)),HEAD[2]+(RAD[2]+.0016)*math.copysign(abs(sin(lat))**POWER,sin(lat))))
 for j in range(rows-1):
  for i in range(segments):
   a=j*segments+i;b=j*segments+(i+1)%segments;faces.append((a,b,b+segments,a+segments))
 top=len(verts);verts.append((0,0,HEAD[2]+RAD[2]+.0016))
 for i in range(segments):faces.append((top,(rows-1)*segments+i,(rows-1)*segments+(i+1)%segments))
 faces.append(tuple(reversed(range(segments))))
 add(finish(mesh('Close-fitting rounded hair cap',verts,faces,mat['hair'])),'Head')
 locks=[
 ('Sculpted main swept fringe',[(.028,-.018,.170),(.010,-.042,.177),(-.009,-.041,.150),(-.030,-.023,.158)],.0120,.0080),
 ('Rounded crown sweep',[(.027,.015,.164),(.003,-.010,.193),(-.027,-.030,.169),(-.037,-.013,.167)],.0110,.0080),
 ('Small curved forehead lock',[(.031,-.015,.166),(.042,-.027,.162),(.030,-.036,.148),(.020,-.032,.151)],.0080,.0065),
 ('Left temple soft lock',[(-.032,-.010,.166),(-.044,-.014,.157),(-.044,-.020,.145),(-.036,-.014,.138)],.0080,.0060),
 ('Right temple round lock',[(.034,.004,.163),(.048,.000,.154),(.046,-.010,.137),(.040,-.006,.130)],.0090,.0065),
 ('Rear crown flow',[(.027,.014,.171),(.009,.037,.184),(-.018,.038,.169),(-.033,.023,.155)],.0100,.0055),
 ('Rear right flow',[(.031,.012,.164),(.044,.029,.159),(.030,.037,.133),(.019,.027,.122)],.0100,.0055)]
 for name,points,w,d in locks:add(lock(name,points,w,d,mat['hair']),'Head')
 transform=Matrix.Translation((.002,0,.102))@Matrix.Rotation(.24,4,'Y')@Matrix.Translation((0,0,-.102))
 for o in parts:
  if groups[o.name]=='Head':o.matrix_world=transform@o.matrix_world
  finish(o)
 return parts,groups

def build_ball(mat):
 """Original truncated-icosahedron panels on a spherical football."""
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1)
 temp=bpy.context.object;vs=[v.co.copy().normalized() for v in temp.data.vertices];fs=[list(p.vertices) for p in temp.data.polygons];bpy.data.objects.remove(temp,do_unlink=True)
 neighbors={i:set() for i in range(len(vs))}
 for f in fs:
  for i in f:neighbors[i].update(k for k in f if k!=i)
 panels=[]
 for i,adj in neighbors.items():
  normal=vs[i];u=(vs[next(iter(adj))]-normal*vs[next(iter(adj))].dot(normal)).normalized();v=normal.cross(u)
  ordered=sorted(adj,key=lambda j:math.atan2(vs[j].dot(v),vs[j].dot(u)))
  panels.append(([(2*vs[i]+vs[j]).normalized() for j in ordered],1))
 for a,b,c in fs:panels.append(([(2*vs[a]+vs[b]).normalized(),(2*vs[b]+vs[a]).normalized(),(2*vs[b]+vs[c]).normalized(),(2*vs[c]+vs[b]).normalized(),(2*vs[c]+vs[a]).normalized(),(2*vs[a]+vs[c]).normalized()],0))
 verts=[];faces=[];indices=[];center=Vector((-.027,-.016,.0155));radius=.016
 for corners,color in panels:
  mid=sum(corners,Vector()).normalized();start=len(verts);verts.append(tuple(center+mid*radius))
  for ring in [.32,.65,.97]:
   for corner in corners:verts.append(tuple(center+(mid.lerp(corner,ring)).normalized()*radius))
  n=len(corners)
  for i in range(n):faces.append((start,start+1+i,start+1+(i+1)%n));indices.append(color)
  for r in range(2):
   for i in range(n):a=start+1+r*n+i;b=start+1+r*n+(i+1)%n;faces.append((a,b,b+n,a+n));indices.append(color)
 ball=mesh('Football cream hexagons and navy pentagons',verts,faces,mat['ballcream']);ball.data.materials.append(mat['navy'])
 for p,idx in zip(ball.data.polygons,indices):p.material_index=idx
 bpy.context.view_layer.objects.active=ball
 mod=ball.modifiers.new('Curved football panel tessellation','SUBSURF');mod.subdivision_type='SIMPLE';mod.levels=2;bpy.ops.object.modifier_apply(modifier=mod.name)
 for vertex in ball.data.vertices:vertex.co=center+(vertex.co-center).normalized()*radius
 finish(ball)
 core=ellipsoid('Football recessed seams',center,(radius*.993,)*3,mat['seam'],64,32)
 return [ball,core]
