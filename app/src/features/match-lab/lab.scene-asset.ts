import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  TorusGeometry,
  PlaneGeometry,
} from "@iwsdk/core";
// Original teaching board: XY plane, +Z faces viewer, 1.02 x .62m, .035m thick.
// Deliberately a diagram, not a reconstructed pitch or measured player tracking.
const green = new MeshBasicMaterial({ color: "#173f39" });
const white = new MeshBasicMaterial({ color: "#fff4ed" });
const blue = new MeshBasicMaterial({ color: "#4975ed" });
const coral = new MeshBasicMaterial({ color: "#ff9988" });
function mesh(
  name: string,
  geometry:
    | BoxGeometry
    | CylinderGeometry
    | SphereGeometry
    | TorusGeometry
    | PlaneGeometry,
  material: MeshBasicMaterial,
  x = 0,
  y = 0,
  z = 0,
) {
  const m = new Mesh(geometry, material);
  m.name = name;
  m.position.set(x, y, z);
  return m;
}
export const labBoard = new Group();
labBoard.name = "Match Lab tactical board";
labBoard.add(mesh("Board", new BoxGeometry(1.02, 0.62, 0.035), green));
for (const y of [-0.28, 0.28])
  labBoard.add(
    mesh("Touchline", new BoxGeometry(0.94, 0.006, 0.002), white, 0, y, 0.019),
  );
for (const x of [-0.47, 0.47]) {
  labBoard.add(
    mesh("Byline", new BoxGeometry(0.006, 0.56, 0.002), white, x, 0, 0.019),
  );
  labBoard.add(
    mesh("Goal", new BoxGeometry(0.024, 0.18, 0.06), coral, x, 0, 0.045),
  );
}
labBoard.add(
  mesh("Halfway", new BoxGeometry(0.006, 0.56, 0.002), white, 0, 0, 0.019),
);
labBoard.add(
  mesh(
    "Centre circle",
    new TorusGeometry(0.085, 0.003, 4, 32),
    white,
    0,
    0,
    0.021,
  ),
);
export const labPawn = new Group();
labPawn.name = "Teammate marker";
const base = mesh(
  "Marker base",
  new CylinderGeometry(0.065, 0.065, 0.02, 24),
  blue,
  0,
  0,
  0.018,
);
base.rotation.x = Math.PI / 2;
labPawn.add(
  base,
  mesh("Marker label", new PlaneGeometry(0.085, 0.085), white, 0, 0, 0.03),
);
export const labBall = mesh(
  "Select the ball",
  new SphereGeometry(0.043, 20, 12),
  white,
);
export const labReplay = mesh(
  "Cutback replay screen",
  new PlaneGeometry(0.98, 0.55125),
  white,
);
