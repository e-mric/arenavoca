import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { Object3D, Vector3 } from "@iwsdk/core";
import { CelebrationMotion } from "./celebration-motion";

function asset() {
  const bytes = readFileSync(
    new URL(
      "../../../public/models/celebration/kawaii-player.glb",
      import.meta.url,
    ),
  );
  const gltf = JSON.parse(
    bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString(),
  );
  const nodes: Object3D[] = gltf.nodes.map(
    (n: {
      name: string;
      translation?: number[];
      rotation?: number[];
      scale?: number[];
    }) => {
      const o = new Object3D();
      o.name = n.name;
      if (n.translation) o.position.fromArray(n.translation);
      if (n.rotation) o.quaternion.fromArray(n.rotation);
      if (n.scale) o.scale.fromArray(n.scale);
      return o;
    },
  );
  gltf.nodes.forEach((n: { children?: number[] }, i: number) =>
    n.children?.forEach((c) => nodes[i].add(nodes[c])),
  );
  const root = new Object3D();
  gltf.scenes[0].nodes.forEach((i: number) => root.add(nodes[i]));
  function named(name: string) {
    return nodes.find((o) => o.name === name)!;
  }
  function center(name: string) {
    const i = gltf.nodes.findIndex((n: { name: string }) => n.name === name);
    const m = gltf.meshes[gltf.nodes[i].mesh];
    const a = gltf.accessors[m.primitives[0].attributes.POSITION];
    root.updateMatrixWorld(true);
    return nodes[i].localToWorld(
      new Vector3()
        .fromArray(a.min)
        .add(new Vector3().fromArray(a.max))
        .multiplyScalar(0.5),
    );
  }
  return {
    root,
    center,
    named,
    motion: new CelebrationMotion(
      named("CelebrateLeftArm"),
      named("CelebrateRightArm"),
      named("CelebrateHead"),
      root,
    ),
  };
}
it("lifts both actual GLB hand meshes in world height instead of twisting them horizontally", () => {
  const a = asset();
  const names = ["Waving arm and open mitten hand", "Lower arm and soft hand"];
  const before = names.map((n) => a.center(n).y);
  a.motion.update(true, 0.5, true);
  names.forEach((n, i) =>
    expect(a.center(n).y).toBeGreaterThan(before[i] + 0.009),
  );
});
it("removes hopping/waving under reduced motion and restores the original pose on expiry", () => {
  const a = asset();
  const before = a.center("Lower arm and soft hand");
  a.motion.update(true, 0.5, true);
  expect(a.root.position.y).toBe(0);
  const held = a.center("Lower arm and soft hand");
  a.motion.update(true, 0.7, true);
  expect(a.center("Lower arm and soft hand").distanceTo(held)).toBeLessThan(
    1e-8,
  );
  a.motion.update(false, 0, false);
  expect(a.center("Lower arm and soft hand").distanceTo(before)).toBeLessThan(
    1e-8,
  );
});
