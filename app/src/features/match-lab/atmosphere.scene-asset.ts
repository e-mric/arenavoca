import {
  BoxGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Shape,
  SphereGeometry,
} from "@iwsdk/core";
// Original miniature stadium window, 1.38 x 1.02 x .36 m. +Y up, +Z toward viewer.
// Root is the frame centre. Banner is attached below; no room mesh or camera access.
const cream = new MeshBasicMaterial({ color: "#fffaf2" });
const ink = new MeshBasicMaterial({ color: "#142352" });
const primary = new MeshBasicMaterial({ color: "#1646ed" });
const secondary = new MeshBasicMaterial({ color: "#ffc4b7" });
const lavender = new MeshBasicMaterial({ color: "#ddd8ff" });
function box(
  parent: Group,
  name: string,
  size: number[],
  pos: number[],
  material: MeshBasicMaterial,
) {
  const m = new Mesh(
    new BoxGeometry(...(size as [number, number, number])),
    material,
  );
  m.name = name;
  m.position.set(...(pos as [number, number, number]));
  parent.add(m);
  return m;
}
export const teamStadium = new Group();
teamStadium.name = "Team stadium window";
box(teamStadium, "Lavender sky", [1.28, 0.76, 0.02], [0, 0, -0.32], lavender);
box(
  teamStadium,
  "Pitch",
  [1.23, 0.018, 0.28],
  [0, -0.29, -0.13],
  new MeshBasicMaterial({ color: "#92b69c" }),
);
for (const x of [-0.54, 0.54])
  box(
    teamStadium,
    "Pitch line",
    [0.006, 0.003, 0.21],
    [x, -0.279, -0.12],
    cream,
  );
for (const z of [-0.22, -0.02])
  box(teamStadium, "Pitch line", [1.08, 0.003, 0.006], [0, -0.279, z], cream);
for (let row = 0; row < 4; row++) {
  box(
    teamStadium,
    `team-${row % 2 ? "secondary" : "primary"} terrace`,
    [1.22, 0.065, 0.06],
    [0, -0.21 + row * 0.075, -0.09 - row * 0.065],
    row % 2 ? secondary : primary,
  );
  for (let seat = 0; seat < 12; seat++) {
    const spectator = new Mesh(
      new SphereGeometry(0.014, 6, 4),
      (seat + row) % 3 ? cream : ink,
    );
    spectator.name = "Distant supporter";
    spectator.position.set(
      -0.55 + seat * 0.1,
      -0.165 + row * 0.075,
      -0.075 - row * 0.065,
    );
    teamStadium.add(spectator);
  }
}
for (const x of [-0.48, 0.48]) {
  box(
    teamStadium,
    "Floodlight mast",
    [0.012, 0.23, 0.012],
    [x, 0.17, -0.28],
    cream,
  );
  box(teamStadium, "Floodlight", [0.14, 0.045, 0.026], [x, 0.29, -0.27], cream);
}
// Rounded, thick frame forms a tangible border around the recessed diorama.
function rounded(w: number, h: number, r: number) {
  const s = new Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}
const frame = rounded(1.38, 0.86, 0.09);
const opening = rounded(1.24, 0.72, 0.055);
frame.holes.push(opening);
const rim = new Mesh(
  new ExtrudeGeometry(frame, {
    depth: 0.055,
    bevelEnabled: false,
    curveSegments: 6,
  }),
  cream,
);
rim.name = "Rounded stadium frame";
rim.position.z = -0.025;
teamStadium.add(rim);
for (const x of [-0.64, 0.64])
  box(teamStadium, "Frame depth", [0.04, 0.69, 0.3], [x, 0, -0.17], cream);
box(teamStadium, "Frame sill", [1.28, 0.045, 0.3], [0, -0.38, -0.17], cream);
box(
  teamStadium,
  "team-primary banner",
  [0.92, 0.15, 0.025],
  [0, -0.52, 0],
  primary,
);
for (const x of [-0.49, 0.49])
  box(
    teamStadium,
    "team-secondary banner tail",
    [0.12, 0.12, 0.018],
    [x, -0.55, -0.012],
    secondary,
  );
const label = new Mesh(new PlaneGeometry(0.82, 0.11), cream);
label.name = "Team banner label";
label.position.set(0, -0.52, 0.016);
teamStadium.add(label);
// A bounded reusable burst. No particles, textures or new meshes allocated during play.
export const teamCelebration = new Group();
teamCelebration.name = "Practice celebration";
for (let i = 0; i < 18; i++) {
  const m = new Mesh(
    new BoxGeometry(0.012, 0.027, 0.004),
    i % 2 ? primary : secondary,
  );
  m.name = `team-${i % 2 ? "primary" : "secondary"} confetti ${i}`;
  teamCelebration.add(m);
}
