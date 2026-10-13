import {
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Path,
  Shape,
} from "@iwsdk/core";

/** Metres. XY is the arena floor, +Z is up from its bowl. Centred, airborne origin.
 * Envelope: 1.36m wide, 1.18m tall including speech tail, 0.32m deep.
 * Articulated groups are transformed on a placement clone, never the prototype.
 */
const arena = new Group();
arena.name = "ArenaVoca arena";
const bowl = new Group();
bowl.name = "Arena bowl";
arena.add(bowl);
const cobalt = new MeshStandardMaterial({
  color: "#2148ef",
  roughness: 0.58,
  metalness: 0.08,
});
const ivory = new MeshStandardMaterial({ color: "#fff9ef", roughness: 0.85 });
const coral = new MeshStandardMaterial({ color: "#ff9988", roughness: 0.55 });
function ellipse(rx: number, ry: number) {
  const shape = new Shape();
  shape.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
  return shape;
}
function solid(
  name: string,
  shape: Shape,
  depth: number,
  material: MeshStandardMaterial,
  z: number,
  parent: Group = bowl,
) {
  const mesh = new Mesh(
    new ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.007,
      bevelThickness: 0.006,
      curveSegments: 32,
    }),
    material,
  );
  mesh.name = name;
  mesh.position.z = z;
  parent.add(mesh);
  return mesh;
}
solid("Arena floor", ellipse(0.445, 0.3), 0.018, ivory, 0);
// Each continuous ring sits higher and farther out: real stepped seating depth.
for (let i = 0; i < 5; i++) {
  const outer = 0.49 + i * 0.043;
  const shape = ellipse(outer, outer * 0.69);
  const hole = new Path();
  hole.absellipse(
    0,
    0,
    outer - 0.048,
    (outer - 0.048) * 0.69,
    0,
    Math.PI * 2,
    true,
    0,
  );
  shape.holes.push(hole);
  const material =
    i === 4
      ? cobalt
      : new MeshStandardMaterial({
          color: ["#7390ff", "#5575f5", "#3b5ee8", "#2c4cd0"][i],
          roughness: 0.7,
        });
  solid(`Seating tier ${i + 1}`, shape, 0.035, material, 0.022 + i * 0.042);
}
const tail = new Shape();
tail.moveTo(0.3, -0.38);
tail.lineTo(0.46, -0.59);
tail.quadraticCurveTo(0.51, -0.63, 0.48, -0.55);
tail.lineTo(0.43, -0.31);
tail.closePath();
solid("Speech tail", tail, 0.035, cobalt, 0.19);
const play = new Group();
play.name = "Coral play";
arena.add(play);
const triangle = new Shape();
triangle.moveTo(-0.085, 0.12);
triangle.quadraticCurveTo(-0.11, 0.14, -0.11, 0.1);
triangle.lineTo(-0.11, -0.1);
triangle.quadraticCurveTo(-0.11, -0.14, -0.075, -0.12);
triangle.lineTo(0.14, -0.015);
triangle.quadraticCurveTo(0.17, 0, 0.14, 0.015);
triangle.closePath();
solid("Play symbol", triangle, 0.032, coral, 0, play);
play.position.z = 0.32;
export default arena;
