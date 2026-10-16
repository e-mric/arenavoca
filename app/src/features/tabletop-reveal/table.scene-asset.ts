import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  PlaneGeometry,
  Shape,
  TorusGeometry,
} from "@iwsdk/core";
// Originals. Y-up, pitch top y=.012; bounds 1.28 x .82m; attack direction +X.
const cream = new MeshStandardMaterial({ color: "#fffaf2", roughness: 0.85 });
const sage = new MeshStandardMaterial({ color: "#8ca78b", roughness: 1 });
const white = new MeshStandardMaterial({ color: "#fffaf2", roughness: 0.8 });
function rounded(
  w: number,
  d: number,
  h: number,
  r: number,
  mat: MeshStandardMaterial,
  name: string,
) {
  const s = new Shape();
  s.moveTo(-w / 2 + r, -d / 2);
  s.lineTo(w / 2 - r, -d / 2);
  s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r);
  s.lineTo(w / 2, d / 2 - r);
  s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2);
  s.lineTo(-w / 2 + r, d / 2);
  s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r);
  s.lineTo(-w / 2, -d / 2 + r);
  s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
  const g = new ExtrudeGeometry(s, {
    depth: h,
    bevelEnabled: false,
    curveSegments: 10,
  });
  g.rotateX(-Math.PI / 2);
  const m = new Mesh(g, mat);
  m.name = name;
  return m;
}
function bar(
  root: Group,
  name: string,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  mat = white,
) {
  const m = new Mesh(new BoxGeometry(w, h, d), mat);
  m.name = name;
  m.position.set(x, y, z);
  root.add(m);
  return m;
}
export const minimalPitch = new Group();
minimalPitch.name = "Sage practice pitch";
minimalPitch.add(rounded(1.28, 0.82, 0.009, 0.07, cream, "Cream pitch rim"));
const turf = rounded(1.23, 0.77, 0.003, 0.055, sage, "Sage playing surface");
turf.position.y = 0.009;
minimalPitch.add(turf);
for (const z of [-0.35, 0.35])
  bar(minimalPitch, "Touchline", 0, 0.014, z, 1.14, 0.001, 0.004);
for (const x of [-0.57, 0, 0.57])
  bar(minimalPitch, "Field line", x, 0.014, 0, 0.004, 0.001, 0.7);
const circle = new Mesh(new TorusGeometry(0.105, 0.002, 4, 48), white);
circle.name = "Centre circle";
circle.rotation.x = -Math.PI / 2;
circle.position.y = 0.014;
minimalPitch.add(circle);
for (const z of [-0.15, 0.15]) {
  bar(minimalPitch, "Goal post", 0.59, 0.095, z, 0.01, 0.17, 0.01);
  bar(minimalPitch, "Penalty box", 0.46, 0.014, z, 0.22, 0.001, 0.004);
}
bar(minimalPitch, "Goal crossbar", 0.59, 0.18, 0, 0.01, 0.01, 0.31);
bar(minimalPitch, "Penalty area line", 0.35, 0.014, 0, 0.004, 0.001, 0.3);
const net = new MeshStandardMaterial({ color: "#b8b9b0", roughness: 1 });
for (let i = -4; i <= 4; i++)
  bar(
    minimalPitch,
    "Goal net vertical",
    0.626,
    0.09,
    i * 0.035,
    0.002,
    0.16,
    0.002,
    net,
  );
for (let i = 1; i <= 5; i++)
  bar(
    minimalPitch,
    "Goal net horizontal",
    0.626,
    i * 0.03,
    0,
    0.002,
    0.002,
    0.29,
    net,
  );
// A small +X arrow makes backward direction explicit without another UI panel.
const arrow = new Shape();
arrow.moveTo(-0.08, -0.005);
arrow.lineTo(0.025, -0.005);
arrow.lineTo(0.025, -0.02);
arrow.lineTo(0.065, 0);
arrow.lineTo(0.025, 0.02);
arrow.lineTo(0.025, 0.005);
arrow.lineTo(-0.08, 0.005);
arrow.closePath();
const arrowGeo = new ExtrudeGeometry(arrow, {
  depth: 0.001,
  bevelEnabled: false,
});
arrowGeo.rotateX(-Math.PI / 2);
const arrowMesh = new Mesh(
  arrowGeo,
  new MeshStandardMaterial({ color: "#1646ed" }),
);
arrowMesh.name = "Attack direction";
arrowMesh.position.set(0, 0.014, 0.38);
minimalPitch.add(arrowMesh);
export const quietTable = new Group();
quietTable.name = "Quiet space table";
quietTable.add(
  rounded(
    1.12,
    0.82,
    0.035,
    0.06,
    new MeshStandardMaterial({ color: "#d6bc96", roughness: 0.9 }),
    "Warm tabletop",
  ),
);
for (const x of [-0.43, 0.43])
  for (const z of [-0.28, 0.28])
    bar(quietTable, "Table leg", x, -0.37, z, 0.045, 0.74, 0.045, cream);
export const placementOutline = new Group();
placementOutline.name = "Hand placement outline";
const lavender = new MeshStandardMaterial({
  color: "#ddd8ff",
  transparent: true,
  opacity: 0.65,
});
for (const z of [-0.25, 0.25])
  bar(
    placementOutline,
    "Outline long edge",
    0,
    0.002,
    z,
    0.78,
    0.003,
    0.004,
    lavender,
  );
for (const x of [-0.39, 0.39])
  bar(
    placementOutline,
    "Outline short edge",
    x,
    0.002,
    0,
    0.004,
    0.003,
    0.5,
    lavender,
  );
// 4.4m arc length, Y-up, +Z faces viewer. Edges curve toward the viewer.
const videoGeometry = new PlaneGeometry(4.4, 2.475, 48, 1),
  positions = videoGeometry.attributes.position;
for (let i = 0; i < positions.count; i++) {
  const t = positions.getX(i) / 6;
  positions.setXYZ(
    i,
    6 * Math.sin(t),
    positions.getY(i),
    6 * (1 - Math.cos(t)),
  );
}
videoGeometry.computeVertexNormals();
export const minimalScreen = new Mesh(
  videoGeometry,
  new MeshBasicMaterial({ color: "#142352" }),
);
minimalScreen.name = "Large curved match screen";
