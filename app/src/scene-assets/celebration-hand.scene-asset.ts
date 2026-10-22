import {
  CatmullRomCurve3,
  Group,
  Mesh,
  MeshBasicMaterial,
  Shape,
  ShapeGeometry,
  TubeGeometry,
  Vector3,
} from "@iwsdk/core";
// Original open-palm silhouette. Metres; origin at wrist, +Y fingers, +Z viewer.
// Mirrored coordinates (not negative scale) keep both front faces outward.
function handGuide(side: number) {
  const root = new Group();
  root.name = side < 0 ? "LeftHandGuide" : "RightHandGuide";
  const shape = new Shape();
  const move = (x: number, y: number) => shape.moveTo(side * x, y);
  const line = (x: number, y: number) => shape.lineTo(side * x, y);
  const curve = (x: number, y: number, a: number, b: number) =>
    shape.quadraticCurveTo(side * x, y, side * a, b);
  move(-0.026, -0.025);
  line(0.025, -0.025);
  curve(0.026, 0, 0.041, 0.025);
  line(0.069, 0.064);
  curve(0.075, 0.077, 0.063, 0.081);
  curve(0.056, 0.084, 0.047, 0.072);
  line(0.034, 0.055);
  line(0.033, 0.132);
  curve(0.033, 0.149, 0.021, 0.148);
  curve(0.013, 0.148, 0.014, 0.132);
  line(0.014, 0.09);
  line(0.01, 0.158);
  curve(0.009, 0.174, -0.003, 0.17);
  curve(-0.01, 0.168, -0.01, 0.155);
  line(-0.01, 0.09);
  line(-0.015, 0.145);
  curve(-0.016, 0.16, -0.028, 0.155);
  curve(-0.034, 0.153, -0.032, 0.138);
  line(-0.029, 0.084);
  line(-0.037, 0.119);
  curve(-0.041, 0.134, -0.051, 0.126);
  curve(-0.057, 0.122, -0.052, 0.107);
  line(-0.048, 0.049);
  curve(-0.048, 0.016, -0.026, -0.025);
  const fill = new Mesh(
    new ShapeGeometry(shape, 8),
    new MeshBasicMaterial({
      color: 0xded8ff,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    }),
  );
  fill.name = "PalmFill";
  root.add(fill);
  const path = new CatmullRomCurve3(
    shape.getPoints(6).map((p) => new Vector3(p.x, p.y, 0)),
    true,
  );
  const outline = new Mesh(
    new TubeGeometry(path, 160, 0.006, 6, true),
    new MeshBasicMaterial({ color: 0x142352 }),
  );
  outline.name = "PalmOutline";
  root.add(outline);
  const inner = new Mesh(
    new TubeGeometry(path, 160, 0.003, 6, true),
    new MeshBasicMaterial({ color: 0xfffaf2 }),
  );
  inner.name = "PalmHighlight";
  inner.position.z = 0.005;
  root.add(inner);
  return root;
}
export const celebrationLeftHand = handGuide(-1);
export const celebrationRightHand = handGuide(1);
