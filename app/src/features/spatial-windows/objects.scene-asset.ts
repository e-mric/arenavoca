import {
  BoxGeometry,
  CapsuleGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
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
// A 52 × 72 cm learning card, 12 mm thick, with rounded corners and two readable faces.
const shape = new Shape(),
  w = 0.52,
  h = 0.72,
  r = 0.025;
shape.moveTo(-w / 2 + r, -h / 2);
shape.lineTo(w / 2 - r, -h / 2);
shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
shape.lineTo(w / 2, h / 2 - r);
shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
shape.lineTo(-w / 2 + r, h / 2);
shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
shape.lineTo(-w / 2, -h / 2 + r);
shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
export const momentCard = new Group();
momentCard.name = "Handheld moment card";
const shell = new Mesh(
  new ExtrudeGeometry(shape, {
    depth: 0.008,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 5,
  }),
  new MeshBasicMaterial({ color: "#e5b7a6" }),
);
shell.position.z = -0.004;
shell.name = "Rounded card edge";
momentCard.add(shell);
for (const [name, z, angle] of [
  ["Spanish face", 0.007, 0],
  ["English face", -0.007, Math.PI],
] as const) {
  const face = new Mesh(
    new PlaneGeometry(0.498, 0.698),
    new MeshBasicMaterial({ color: "#fff4ed" }),
  );
  face.name = name;
  face.position.z = z;
  face.rotation.y = angle;
  momentCard.add(face);
}
const image = new Mesh(
  new PlaneGeometry(0.458, 0.258),
  new MeshBasicMaterial({ color: "#d8c1c9" }),
);
image.name = "Moment illustration or replay";
image.position.set(0, 0.12, 0.009);
momentCard.add(image);
