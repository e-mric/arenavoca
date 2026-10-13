import { Mesh, MeshBasicMaterial, PlaneGeometry } from "@iwsdk/core";
/** Independent parentless surfaces; scene anchors own their placement. */
function plane(name: string, width: number, height: number, color: string) {
  const mesh = new Mesh(
    new PlaneGeometry(width, height),
    new MeshBasicMaterial({ color }),
  );
  mesh.name = name;
  return mesh;
}
export const matchScreen = plane(
  "Match screen",
  7.2,
  (7.2 * 9) / 16,
  "#14281b",
);
export const matchFrame = plane("Match frame", 7.29, 4.14, "#33443b");
export const passDiagram = plane(
  "Pass diagram",
  0.7,
  (0.7 * 9) / 16,
  "#19432f",
);
export const traceDiagram = plane(
  "Trace diagram",
  0.98,
  (0.98 * 9) / 16,
  "#19432f",
);
