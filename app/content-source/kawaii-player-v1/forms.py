"""Original Blender construction helpers; all distances are metres."""
import bpy, math
from mathutils import Vector
from math import sin,cos,pi

def material(name,hexcode,roughness=.65):
 hexcode=hexcode.lstrip('#')
 rgb=[int(hexcode[i:i+2],16)/255 for i in (0,2,4)]
 linear=[c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in rgb]
 m=bpy.data.materials.new(name);m.diffuse_color=(*linear,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*linear,1)
 bs.inputs['Roughness'].default_value=roughness
 return m

def mesh(name,verts,faces,mat):
 data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update()
 o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o)
 if mat:o.data.materials.append(mat)
 for p in data.polygons:p.use_smooth=True
 return o

def ellipsoid(name,center,radii,mat,segments=24,rings=12):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=center)
 o=bpy.context.object;o.name=name;o.scale=radii;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 o.data.materials.append(mat)
 for p in o.data.polygons:p.use_smooth=True
 return o

def signed(v,p):return math.copysign(abs(v)**p,v)

def softbox(name,center,radii,mat,power=.78,segments=48,rings=24):
 # Superellipsoid: fuller than a sphere, with rounded forehead, cheeks and chin.
 verts=[(center[0],center[1],center[2]-radii[2])];faces=[]
 for j in range(1,rings):
  lat=-pi/2+pi*j/rings
  for i in range(segments):
   t=2*pi*i/segments
   verts.append((center[0]+radii[0]*signed(cos(lat),power)*signed(cos(t),power),center[1]+radii[1]*signed(cos(lat),power)*signed(sin(t),power),center[2]+radii[2]*signed(sin(lat),power)))
 for i in range(segments):faces.append((0,1+(i+1)%segments,1+i))
 for j in range(rings-2):
  for i in range(segments):
   a=1+j*segments+i;b=1+j*segments+(i+1)%segments
   faces.append((a,b,b+segments,a+segments))
 top=len(verts);verts.append((center[0],center[1],center[2]+radii[2]))
 for i in range(segments):faces.append((top,1+(rings-2)*segments+i,1+(rings-2)*segments+(i+1)%segments))
 return mesh(name,verts,faces,mat)

def loft(name,sections,mat,segments=24):
 # Horizontal sections: centre x,y,z; half width, half depth.
 verts=[];faces=[]
 for x,y,z,rx,ry in sections:
  for i in range(segments):
   t=2*pi*i/segments;verts.append((x+rx*cos(t),y+ry*sin(t),z))
 for j in range(len(sections)-1):
  for i in range(segments):
   a=j*segments+i;b=j*segments+(i+1)%segments;faces.append((a,b,b+segments,a+segments))
 faces.append(tuple(reversed(range(segments))))
 faces.append(tuple((len(sections)-1)*segments+i for i in range(segments)))
 return mesh(name,verts,faces,mat)

def stroke(name,points,radius,mat):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=16;c.bevel_depth=radius;c.bevel_resolution=3
 sp=c.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
 for p,co in zip(sp.bezier_points,points):p.co=co;p.handle_left_type=p.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(mat)
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)
 return o

def tuft(name,points,widths,depths,mat,steps=22,sides=16):
 # Swept sculpted leaf with a varying elliptical cross-section, not a stock oval.
 pts=[Vector(p) for p in points];verts=[];faces=[]
 for j in range(steps+1):
  t=j/steps;u=1-t;pos=u**3*pts[0]+3*u*u*t*pts[1]+3*u*t*t*pts[2]+t**3*pts[3]
  tangent=3*u*u*(pts[1]-pts[0])+6*u*t*(pts[2]-pts[1])+3*t*t*(pts[3]-pts[2]);tangent.normalize()
  normal=Vector((0,-1,.12));across=tangent.cross(normal).normalized();normal=across.cross(tangent).normalized()
  k=min(2,int(t*3));v=t*3-k
  width=widths[k]*(1-v)+widths[k+1]*v;depth=depths[k]*(1-v)+depths[k+1]*v
  for i in range(sides):
   a=2*pi*i/sides;p=pos+across*cos(a)*width+normal*sin(a)*depth;verts.append(tuple(p))
 for j in range(steps):
  for i in range(sides):
   a=j*sides+i;b=j*sides+(i+1)%sides;faces.append((a,b,b+sides,a+sides))
 faces.append(tuple(reversed(range(sides))));faces.append(tuple(steps*sides+i for i in range(sides)))
 return mesh(name,verts,faces,mat)

def bevelbox(name,center,size,radius,mat):
 bpy.ops.mesh.primitive_cube_add(size=1,location=center);o=bpy.context.object;o.name=name;o.dimensions=size
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 o.data.materials.append(mat);mod=o.modifiers.new('Soft moulded corners','BEVEL');mod.width=radius;mod.segments=4
 bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 for p in o.data.polygons:p.use_smooth=True
 normal=o.modifiers.new('Weighted soft normals','WEIGHTED_NORMAL');normal.keep_sharp=True
 bpy.ops.object.modifier_apply(modifier=normal.name)
 return o
