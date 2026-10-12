import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "@iwsdk/core";
import { bevelBox } from "./lib/hardsurface";
/** Original lounge shell: metres, +Y up, screen ahead on -Z.
 * Envelope x ±6, z -8..6, y -.12..5.2. Seated origin stays clear.
 * Upholstered seats are behind the viewer; the screen opening is unobstructed.
 */
const room = new Group();
room.name = "Sports viewing lounge";
const wall = new MeshStandardMaterial({ color: "#242a35", roughness: 0.92 });
const floor = new MeshStandardMaterial({ color: "#191d27", roughness: 0.98 });
const wood = new MeshStandardMaterial({ color: "#493b31", roughness: 0.78 });
const trim = new MeshStandardMaterial({
  color: "#151921",
  metalness: 0.35,
  roughness: 0.52,
});
const fabric = new MeshStandardMaterial({ color: "#343845", roughness: 1 });
const glow = new MeshBasicMaterial({ color: "#b6d4eb" });
const warm = new MeshBasicMaterial({ color: "#ffddb0" });
function block(
  name: string,
  size: [number, number, number],
  position: [number, number, number],
  material: MeshStandardMaterial | MeshBasicMaterial,
  round = 0,
) {
  const mesh = new Mesh(
    round
      ? bevelBox(
          ...size,
          Math.min(round, size[0] / 4, size[1] / 4, size[2] / 4),
          round,
          3,
        )
      : new BoxGeometry(...size),
    material,
  );
  mesh.name = name;
  mesh.position.set(...position);
  room.add(mesh);
  return mesh;
}
block("Carpet floor", [12, 0.12, 14], [0, -0.06, -1], floor);
block("Left acoustic wall", [0.18, 5.1, 14], [-6, 2.55, -1], wall);
block("Right acoustic wall", [0.18, 5.1, 14], [6, 2.55, -1], wall);
block("Front acoustic wall", [12, 5.1, 0.2], [0, 2.55, -8], wall);
block("Rear acoustic wall", [12, 5.1, 0.2], [0, 2.55, 6], wall);
block("Ceiling", [12, 0.18, 14], [0, 5.13, -1], wall);
block("Screen surround", [7.65, 4.44, 0.18], [0, 2.5, -6.08], trim, 0.075);
block("Screen plinth", [8, 0.35, 0.8], [0, 0.175, -6.4], trim, 0.07);
block("Left timber wainscot", [0.1, 0.8, 13.8], [-5.88, 0.4, -1], wood);
block("Right timber wainscot", [0.1, 0.8, 13.8], [5.88, 0.4, -1], wood);
for (const side of [-1, 1]) {
  block(
    `Accent wall wash ${side}`,
    [0.045, 0.035, 12],
    [side * 5.8, 0.82, -1],
    glow,
  );
  block(`Ceiling soffit ${side}`, [0.9, 0.3, 13], [side * 5.55, 4.9, -1], trim);
  block(
    `Accent ceiling cove ${side}`,
    [0.08, 0.045, 13],
    [side * 5.15, 4.739, -1],
    glow,
  );
  for (let i = 0; i < 18; i++) {
    block(
      `Timber acoustic slat ${side}-${i}`,
      [0.09, 2.9, 0.12],
      [side * 5.9, 2.32, -7.2 + i * 0.66],
      wood,
      0.012,
    );
  }
  for (let i = 0; i < 5; i++) {
    const fitting = new Mesh(
      new CylinderGeometry(0.095, 0.095, 0.02, 16),
      trim,
    );
    fitting.name = `Downlight collar ${side}-${i}`;
    fitting.position.set(side * 3.2, 5.035, -5 + i * 2.2);
    room.add(fitting);
    const light = new Mesh(new CylinderGeometry(0.065, 0.065, 0.022, 16), warm);
    light.name = `Downlight diffuser ${side}-${i}`;
    light.position.copy(fitting.position);
    light.position.y -= 0.012;
    room.add(light);
  }
}
for (let row = 0; row < 2; row++) {
  const z = 1.65 + row * 2.15,
    rise = row * 0.18;
  block(
    `Rear seating riser ${row}`,
    [10.5, 0.18 + rise, 1.9],
    [0, (0.18 + rise) / 2, z + 0.15],
    floor,
    0.035,
  );
  for (let seat = 0; seat < 7; seat++) {
    const x = (seat - 3) * 1.28,
      y = 0.18 + rise;
    block(
      `Seat cushion ${row}-${seat}`,
      [0.82, 0.2, 0.78],
      [x, y + 0.34, z],
      fabric,
      0.09,
    );
    block(
      `Seat back ${row}-${seat}`,
      [0.9, 1.02, 0.24],
      [x, y + 0.77, z + 0.38],
      fabric,
      0.1,
    );
    block(
      `Seat base ${row}-${seat}`,
      [0.68, 0.32, 0.65],
      [x, y + 0.16, z + 0.03],
      trim,
      0.06,
    );
    for (const side of [-1, 1])
      block(
        `Armrest ${row}-${seat}-${side}`,
        [0.16, 0.48, 0.82],
        [x + side * 0.48, y + 0.43, z],
        fabric,
        0.045,
      );
  }
  block(
    `Accent aisle ${row}`,
    [10.3, 0.018, 0.035],
    [0, 0.185 + rise, z - 0.8],
    glow,
  );
}
export default room;
