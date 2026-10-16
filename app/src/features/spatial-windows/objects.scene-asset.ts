import {
  BoxGeometry,
  CapsuleGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  ShapeGeometry,
  Shape,
  ExtrudeGeometry,
} from "@iwsdk/core";
// Handles are intentionally tactile manufactured primitives, with +Z facing the viewer.
export const windowGrip = new Mesh(
  new CapsuleGeometry(0.025, 0.5, 4, 8),
  new MeshBasicMaterial({ color: "#e5b7a6" }),
);
windowGrip.geometry.rotateZ(Math.PI / 2);
windowGrip.name = "Two hand grip";
export const windowMove = new Mesh(
  new BoxGeometry(0.18, 0.06, 0.045),
  new MeshBasicMaterial({ color: "#729bee" }),
);
windowMove.name = "Point and hold to move";
export const windowResize = new Mesh(
  new BoxGeometry(0.075, 0.075, 0.045),
  new MeshBasicMaterial({ color: "#e6c178" }),
);
windowResize.name = "Pull corner to resize";
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
