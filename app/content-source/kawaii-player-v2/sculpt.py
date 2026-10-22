"""Refined continuous forms, swept hair and flush painted facial colour."""
import bpy,math
from math import sin,cos,pi
from mathutils import Vector
from forms import material,mesh,ellipsoid,softbox,loft,stroke

def soften(o,levels=1):
 bpy.context.view_layer.objects.active=o
 mod=o.modifiers.new('Soft continuous profile','SUBSURF');mod.levels=levels
 bpy.ops.object.modifier_apply(modifier=mod.name)
 return o

def fuse(name,objects,voxel=.0010):
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=objects[0];o.name=name
 remesh=o.modifiers.new('Sculpted palm and arm union','REMESH');remesh.mode='VOXEL';remesh.voxel_size=voxel
 bpy.ops.object.modifier_apply(modifier=remesh.name)
 smooth=o.modifiers.new('Soft sculpt finish','SMOOTH');smooth.factor=1;smooth.iterations=4
 bpy.ops.object.modifier_apply(modifier=smooth.name)
 for p in o.data.polygons:p.use_smooth=True
 return o

def lock(name,points,width,depth,mat,steps=30,sides=20):
 # Rounded-end swept lock. Square-root end profile removes the old pointed tips.
 pts=[Vector(p) for p in points];verts=[tuple(pts[0])];faces=[]
 for j in range(1,steps):
  t=j/steps;u=1-t;p=u**3*pts[0]+3*u*u*t*pts[1]+3*u*t*t*pts[2]+t**3*pts[3]
  tangent=(3*u*u*(pts[1]-pts[0])+6*u*t*(pts[2]-pts[1])+3*t*t*(pts[3]-pts[2])).normalized()
  across=tangent.cross(Vector((0,-1,.08))).normalized();normal=across.cross(tangent).normalized()
  profile=math.sqrt(sin(pi*t))*(1-.18*t)
  for i in range(sides):
   a=2*pi*i/sides;verts.append(tuple(p+profile*(across*cos(a)*width+normal*sin(a)*depth)))
 for i in range(sides):faces.append((0,1+(i+1)%sides,1+i))
 for j in range(steps-2):
  for i in range(sides):
   a=1+j*sides+i;b=1+j*sides+(i+1)%sides;faces.append((a,b,b+sides,a+sides))
 end=len(verts);verts.append(tuple(pts[3]))
 for i in range(sides):faces.append((end,1+(steps-2)*sides+i,1+(steps-2)*sides+(i+1)%sides))
 return mesh(name,verts,faces,mat)

def build_character(collection,mat):
 parts=[];owners={}
 def add(o,bone='Torso'):
  for c in list(o.users_collection):c.objects.unlink(o)
  collection.objects.link(o);parts.append(o);owners[o.name]=bone;return o
 # Softly tapered shirt; subdivision rounds the shoulder/hem transitions.
 add(soften(loft('Jersey',[(0,0,.057,.017,.010),(0,0,.058,.019,.012),(0,0,.063,.021,.013),(0,0,.077,.024,.014),(0,0,.086,.027,.014),(0,0,.091,.026,.013),(0,0,.096,.017,.009),(0,0,.099,.011,.007)],mat['blue'],32)))
 # One sculpted shorts volume keeps the crotch from becoming a protruding pouch.
 shorts=[softbox('Shorts body',(0,.0005,.054),(.021,.013,.011),mat['navy'],.9,32,20)]
 for side in [-1,1]:shorts.append(softbox('Shorts opening',(side*.011,0,.047),(.011,.012,.007),mat['navy'],.8,24,14))
 add(fuse('Soft shorts',shorts,.0010))
 for side,tag in [(-1,'Left'),(1,'Right')]:
  x=side*.0115
  add(ellipsoid(tag+' knee',(x,0,.039),(.0078,.0078,.010),mat['skin']),tag+'Leg')
  add(soften(loft(tag+' sock',[(x,0,.016,.0065,.0065),(x,0,.019,.0078,.0073),(x,0,.032,.0076,.0076),(x,0,.036,.0082,.0080),(x,0,.037,.0078,.0075)],mat['cream'],24)),tag+'Leg')
  add(softbox(tag+' boot upper',(x,-.005,.0125),(.012,.0175,.0088),mat['navy'],.88,32,18),tag+'Leg')
  add(softbox(tag+' coral sole',(x,-.005,.0052),(.0125,.0180,.0022),mat['coral'],.65,32,12),tag+'Leg')
  for i,(dx,dy) in enumerate([(-.006,-.015),(.006,-.015),(-.006,.004),(.006,.004)]):
   add(ellipsoid(tag+' stud '+str(i),(x+dx,dy,.0021),(.002,.0023,.002),mat['coral'],12,8),tag+'Leg')
  sleeve=loft(tag+' sleeve',[(side*.034,0,.071,.0084,.009),(side*.034,0,.073,.010,.0105),(side*.030,0,.085,.0118,.012),(side*.023,0,.090,.011,.012),(side*.020,0,.092,.008,.009)],mat['blue'],28)
  # Keep rings in ascending height for a reliable closed subdivision surface.
  add(soften(sleeve),tag+'Arm')
  cuff=loft(tag+' cream cuff',[(side*.035,0,.069,.0083,.0095),(side*.035,0,.070,.0097,.010),(side*.034,0,.073,.010,.0105),(side*.033,0,.074,.0087,.0095)],mat['cream'],24)
  add(soften(cuff),tag+'Arm')
  arm=loft('Arm sculpt',[(side*.041,-.001,.052,.004,.0045),(side*.041,-.001,.056,.0065,.0065),(side*.038,-.001,.065,.0077,.0074),(side*.034,0,.073,.0077,.0078),(side*.033,0,.076,.0065,.0070)],mat['skin'],24)
  palm=ellipsoid('Palm sculpt',(side*.042,-.001,.054),(.0072,.006,.008),mat['skin'],24,16)
  thumb=ellipsoid('Thumb sculpt',(side*.038,-.005,.055),(.0042,.004,.005),mat['skin'],20,12)
  add(fuse(tag+' soft arm and hand',[arm,palm,thumb],.0010),tag+'Arm')
 add(ellipsoid('Neck',(0,0,.099),(.010,.009,.009),mat['skin']))
 add(stroke('Visible coral crew collar',[(-.012,-.009,.098),(-.009,-.013,.095),(0,-.015,.093),(.009,-.013,.095),(.012,-.009,.098)],.0014,mat['coral']))
 HEAD=(0,0,.135);RAD=(.044,.032,.038);POWER=.72
 head=add(softbox('Head sculpt',HEAD,RAD,mat['skin'],POWER,80,40),'Head')
 # Actual vertex colour, flush with the skin: no separate cheek meshes.
 headmat=mat['skin'].copy();headmat.name='Face | painted blush';mat['face']=headmat
 head.data.materials.clear();head.data.materials.append(headmat)
 colours=head.data.color_attributes.new(name='FaceTint',type='FLOAT_COLOR',domain='POINT')
 base=mat['skin'].node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value
 blush=mat['blush'].node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value
 for vertex in head.data.vertices:
  x,y,z=vertex.co
  amount=max(math.exp(-((x-side*.026)/.0065)**2-((z-.124)/.0040)**2) for side in [-1,1])*.48
  amount*=max(0,min(1,(-y-.015)/.010))
  colours.data[vertex.index].color=tuple(base[k]*(1-amount)+blush[k]*amount for k in range(3))+(1,)
 colour_node=headmat.node_tree.nodes.new('ShaderNodeVertexColor');colour_node.layer_name='FaceTint'
 headmat.node_tree.links.new(colour_node.outputs['Color'],headmat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
 for side,tag in [(-1,'Left'),(1,'Right')]:
  add(ellipsoid(tag+' ear',(side*.0425,.001,.134),(.0065,.006,.008),mat['skin'],24,16),'Head')
 def front(x,z):
  q=2/POWER;r=max(.001,1-(abs(x)/RAD[0])**q-(abs(z-HEAD[2])/RAD[2])**q)
  return -RAD[1]*r**(POWER/2)
 for side,tag in [(-1,'Left'),(1,'Right')]:
  x=side*.0165;z=.133
  eye=add(ellipsoid(tag+' dot eye',(x,front(x,z)-.00045,z),(.0034,.00085,.0049),mat['ink'],32,20),'Head')
  eps=.00001;eye.rotation_euler.z=math.atan((front(x+eps,z)-front(x-eps,z))/(2*eps))
  x=side*.016;z=.145
  add(stroke(tag+' eyebrow',[(x+u,front(x+u,z+v)-.0006,z+v) for u,v in [(-.0025,0),(0,.0007),(.0025,0)]],.00040,mat['hair']),'Head')
 smile=[(-.0068,.1215),(-.005,.1187),(0,.1170),(.005,.1187),(.0068,.1215)]
 add(stroke('Happy smile',[(x,front(x,z)-.00055,z) for x,z in smile],.00057,mat['ink']),'Head')
 # Low scalp shell follows the new head rather than hanging down as a helmet.
 verts=[];faces=[];segments=80;rows=22
 for j in range(rows):
  for i in range(segments):
   theta=2*pi*i/segments;frontward=max(0,-sin(theta))
   low=-.30+.85*frontward+.25*abs(cos(theta));lat=low+(pi/2-low)*j/rows
   verts.append(((RAD[0]+.0014)*math.copysign(abs(cos(lat)*cos(theta))**POWER,cos(theta)),(RAD[1]+.0014)*math.copysign(abs(cos(lat)*sin(theta))**POWER,sin(theta)),HEAD[2]+(RAD[2]+.0014)*math.copysign(abs(sin(lat))**POWER,sin(lat))))
 for j in range(rows-1):
  for i in range(segments):
   a=j*segments+i;b=j*segments+(i+1)%segments;faces.append((a,b,b+segments,a+segments))
 top=len(verts);verts.append((0,0,HEAD[2]+RAD[2]+.0014))
 for i in range(segments):faces.append((top,(rows-1)*segments+i,(rows-1)*segments+(i+1)%segments))
 cap=add(mesh('Hair cap',verts,faces,mat['hair']),'Head')
 bpy.context.view_layer.objects.active=cap;solid=cap.modifiers.new('Soft hairline thickness','SOLIDIFY');solid.thickness=.001
 bpy.ops.object.modifier_apply(modifier=solid.name)
 locks=[
  ('Broad swept fringe',[(.034,-.009,.169),(.014,-.035,.178),(-.027,-.040,.166),(-.039,-.018,.150)],.0120,.0075),
  ('Low crown sweep',[(.035,.010,.167),(.012,.000,.179),(-.024,-.019,.177),(-.037,-.019,.164)],.0125,.0075),
  ('Soft forward lock',[(.036,-.014,.164),(.043,-.029,.163),(.033,-.040,.149),(.017,-.038,.153)],.0095,.0070),
  ('Right temple sweep',[(.037,.001,.158),(.048,-.008,.154),(.048,-.017,.141),(.043,-.018,.136)],.0065,.0045),
  ('Back crown flow',[(.024,.016,.171),(.003,.029,.181),(-.025,.029,.173),(-.037,.018,.158)],.0080,.0050)]
 for i,(name,points,width,depth) in enumerate(locks):add(lock(name,points,width,depth,mat['hair2' if i==1 else 'hair']),'Head')
 return parts,owners
