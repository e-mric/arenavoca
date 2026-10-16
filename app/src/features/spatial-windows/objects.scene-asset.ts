import {
  CapsuleGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  ShapeGeometry,
  Shape,
  ExtrudeGeometry,
} from "@iwsdk/core";
// A 52 × 72 cm learning card, 20 mm thick, with rounded corners and two readable faces.
function roundedShape(w: number, h: number, r: number) {
  const shape = new Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return shape;
}
// Browser-style manipulation chrome. Local +Z faces the viewer; cream
// near-grab backing and inset ray surface form one bar, with separate inputs.
const handleCream = new MeshBasicMaterial({ color: "#fffaf2" });
const handleEdge = new MeshBasicMaterial({ color: "#f3e6d3" });
const handleInk = new MeshBasicMaterial({ color: "#142352" });
function handleBody(w: number, h: number, depth: number, front: boolean) {
  const mesh = new Mesh(
    new ExtrudeGeometry(roundedShape(w, h, h / 2), {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 2,
      steps: 1,
      curveSegments: 8,
    }),
    front ? handleCream : handleEdge,
  );
  mesh.position.z = -depth / 2;
  mesh.name = front ? "Cream handle face" : "Cream handle edge";
  return mesh;
}
function stroke(
  length: number,
  radius: number,
  x: number,
  y: number,
  angle: number,
) {
  const mesh = new Mesh(new CapsuleGeometry(radius, length, 4, 8), handleInk);
  mesh.rotation.z = angle;
  mesh.position.set(x, y, 0.008);
  mesh.name = "Navy handle mark";
  return mesh;
}
export const windowGrip = handleBody(0.328, 0.06, 0.016, false);
windowGrip.name = "Pinch bar to move";
export const windowMove = new Group();
windowMove.name = "Hold bar to move";
windowMove.add(handleBody(0.32, 0.052, 0.01, true));
windowMove.add(stroke(0.08, 0.002, 0, 0, Math.PI / 2));
export const windowResizeGrip = handleBody(0.07, 0.07, 0.016, false);
windowResizeGrip.name = "Pinch corner to resize";
export const windowResize = new Group();
windowResize.name = "Pull corner to resize";
windowResize.add(handleBody(0.062, 0.062, 0.01, true));
// Two diagonal resize marks; no large coloured block in the viewing field.
windowResize.add(stroke(0.025, 0.0018, 0, 0, -Math.PI / 4));
windowResize.add(stroke(0.014, 0.0018, 0.01, -0.01, -Math.PI / 4));
// UVs preserve the full image; the actual silhouette clips its corners.
function roundedFace(w: number, h: number, r: number) {
  const geometry = new ShapeGeometry(roundedShape(w, h, r), 12);
  const position = geometry.getAttribute("position"),
    uv = geometry.getAttribute("uv");
  for (let i = 0; i < position.count; i++)
    uv.setXY(i, position.getX(i) / w + 0.5, position.getY(i) / h + 0.5);
  return geometry;
}
const shape = roundedShape(0.52, 0.72, 0.055);
export const momentCard = new Group();
momentCard.name = "Handheld moment card";
const shell = new Mesh(
  new ExtrudeGeometry(shape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 5,
  }),
  new MeshBasicMaterial({ color: "#f3e6d3" }),
);
shell.position.z = -0.008;
shell.name = "Rounded card edge";
momentCard.add(shell);
for (const [name, z, angle] of [
  ["Spanish face", 0.011, 0],
  ["English face", -0.011, Math.PI],
] as const) {
  const face = new Mesh(
    roundedFace(0.498, 0.698, 0.045),
    new MeshBasicMaterial({ color: "#fffaf2" }),
  );
  face.name = name;
  face.position.z = z;
  face.rotation.y = angle;
  momentCard.add(face);
}
const image = new Mesh(
  roundedFace(0.458, 0.3, 0.038),
  new MeshBasicMaterial({ color: "#d8c1c9" }),
);
image.name = "Moment illustration or replay";
image.position.set(0, 0.182, 0.013);
momentCard.add(image);

// A single, pocket-sized instruction card. UI lives on its two opposing faces.
export const practiceCard = new Group();
practiceCard.name = "Pocket instruction card";
const practiceShell = shell.clone();
practiceShell.scale.set(0.71, 0.66, 1);
practiceShell.name = "Cream rounded edge";
practiceShell.material = new MeshBasicMaterial({ color: "#ddd8ff" });
practiceCard.add(practiceShell);
