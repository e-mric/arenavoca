import { Group, Mesh, MeshBasicMaterial, PlaneGeometry } from "@iwsdk/core";
/** Parentless, deterministic surfaces. Front faces +Z; all dimensions are metres.
 * Runtime textures belong to the placed instance. This catalog stays DOM-free.
 */
const surfaces = new Group();
surfaces.name = "Viewing surfaces";
function plane(
  name: string,
  width: number,
  height: number,
  color: string,
  x: number,
  y: number,
  z: number,
) {
  const mesh = new Mesh(
    new PlaneGeometry(width, height),
    new MeshBasicMaterial({ color }),
  );
  mesh.name = name;
  mesh.position.set(x, y, z);
  surfaces.add(mesh);
  return mesh;
}
plane("Match screen", 2.5, (2.5 * 9) / 16, "#14281b", -0.65, 1.6, -2.2);
plane("Match frame", 2.57, 1.48, "#33443b", -0.65, 1.6, -2.208);
plane("Pass diagram", 0.7, (0.7 * 9) / 16, "#19432f", 1.4, 1.49, -2.03);
plane("Trace diagram", 0.98, (0.98 * 9) / 16, "#19432f", 0, 1.065, -0.829);
const floor = plane("Floor", 30, 30, "#142019", 0, -0.04, 0);
floor.rotation.x = -Math.PI / 2;
export default surfaces;
