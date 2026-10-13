import {
  createSystem,
  Entity,
  Grabbed,
  GrabSystem,
  Group,
  Matrix4,
  Object3D,
  Quaternion,
  Vector3,
  VisibilityState,
  type World,
} from "@iwsdk/core";
import { SpatialWindow } from "./components";
import { resizedScale, windowScale } from "./math";
export class WindowTargets extends createSystem({
  handles: { required: [SpatialWindow] },
}) {}
type Binding = {
  id: string;
  anchor: Object3D;
  content: Object3D;
  near: Entity;
  far: Entity;
  resize: Entity;
  targets: Entity[];
  width: number;
  height: number;
  direct: boolean;
  owner: Entity | null;
  resizedFrom: number;
  resizeDistance: number;
  initialPosition: Vector3;
  initialRotation: Quaternion;
  initialScale: Vector3;
};
/** Window transforms have no dependency on the match player or learning clock. */
export class SpatialWindows {
  private bindings = new Map<string, Binding>();
  private offset = new Vector3();
  private position = new Vector3();
  private scale = new Vector3();
  private matrix = new Matrix4();
  private inverse = new Matrix4();
  private grab: GrabSystem;
  constructor(private world: World) {
    world.registerSystem(WindowTargets);
    this.grab = world.getSystem(GrabSystem)!;
    this.grab.config.useHandPinchForGrab.value = true;
    world.addCleanup(
      world.visibilityState.subscribe((state) => {
        if (state !== VisibilityState.Visible) this.releaseAll();
      }),
    );
  }
  bind(
    id: string,
    content: Object3D,
    width: number,
    height: number,
    direct = false,
  ) {
    const anchor = this.world.requireSceneObject<Group>(`window-${id}`);
    const handles = [
      ...this.world.getSystem(WindowTargets)!.queries.handles.entities,
    ].filter((e) => e.getValue(SpatialWindow, "window") === id);
    const target = (kind: number) => {
      const e = handles.find((e) => e.getValue(SpatialWindow, "kind") === kind);
      if (!e) throw new Error(`Missing ${id} manipulation target ${kind}`);
      return e;
    };
    const b: Binding = {
      id,
      anchor,
      content,
      width,
      height,
      direct,
      near: target(0),
      far: target(1),
      resize: target(2),
      targets: [target(0), target(1), target(2)],
      owner: null,
      resizedFrom: 1,
      resizeDistance: 1,
      initialPosition: anchor.position.clone(),
      initialScale: anchor.scale.clone(),
      initialRotation: anchor.quaternion.clone(),
    };
    this.bindings.set(id, b);
    this.sync(b);
    return anchor;
  }
  place(
    id: string,
    x: number,
    y: number,
    z: number,
    yaw: number,
    width: number,
    height: number,
  ) {
    const b = this.bindings.get(id)!;
    this.release(b);
    b.anchor.position.set(x, y, z);
    b.anchor.rotation.set(0, yaw, 0);
    b.anchor.scale.setScalar(1);
    b.width = width;
    b.height = height;
    b.initialPosition.copy(b.anchor.position);
    b.initialRotation.copy(b.anchor.quaternion);
    b.initialScale.copy(b.anchor.scale);
    this.sync(b);
  }
  size(id: string, width: number, height: number) {
    const b = this.bindings.get(id)!;
    b.width = width;
    b.height = height;
  }
  reset() {
    for (const b of this.bindings.values()) {
      this.release(b);
      b.anchor.position.copy(b.initialPosition);
      b.anchor.quaternion.copy(b.initialRotation);
      b.anchor.scale.copy(b.initialScale);
      this.sync(b);
    }
  }
  releaseAll() {
    for (const b of this.bindings.values()) this.release(b);
  }
  private release(b: Binding) {
    for (const e of b.targets)
      if (e.hasComponent(Grabbed)) this.grab.forceRelease(e);
    b.owner = null;
    for (const e of b.targets) e.setValue(SpatialWindow, "held", false);
  }
  private offsetFor(b: Binding, kind: number) {
    return this.offset.set(
      kind === 2 ? b.width / 2 + 0.055 : 0,
      kind === 0 && b.direct ? 0 : -b.height / 2 - 0.09,
      kind === 1 ? 0.045 : 0,
    );
  }
  private sync(b: Binding) {
    b.anchor.updateMatrix();
    for (const e of b.targets) {
      const o = e.object3D!;
      if (o === b.anchor || e === b.owner) continue;
      this.position
        .copy(this.offsetFor(b, e.getValue(SpatialWindow, "kind")!))
        .applyMatrix4(b.anchor.matrix);
      o.position.copy(this.position);
      o.quaternion.copy(b.anchor.quaternion);
      o.scale.copy(b.anchor.scale);
    }
  }
  update() {
    for (const b of this.bindings.values()) {
      const visible = b.content.visible;
      b.anchor.visible = visible;
      if (!visible) this.release(b);
      for (const e of b.targets)
        if (e.object3D !== b.anchor) e.object3D!.visible = visible;
      if (!visible) continue;
      if (b.owner && !b.owner.hasComponent(Grabbed)) b.owner = null;
      for (const e of b.targets)
        if (e.hasComponent(Grabbed)) {
          if (b.owner && b.owner !== e) {
            this.grab.forceRelease(e);
            continue;
          }
          if (!b.owner) {
            b.owner = e;
            b.resizedFrom = b.anchor.scale.x;
            b.resizeDistance = e.object3D!.position.distanceTo(
              b.anchor.position,
            );
          }
        }
      if (b.owner) {
        const kind = b.owner.getValue(SpatialWindow, "kind")!,
          o = b.owner.object3D!;
        if (kind === 2) {
          b.anchor.scale.setScalar(
            resizedScale(
              b.resizedFrom,
              b.resizeDistance,
              o.position.distanceTo(b.anchor.position),
            ),
          );
        } else if (o !== b.anchor) {
          // Handle and anchor share their parent. Undo the handle's local offset.
          o.updateMatrix();
          this.matrix.copy(o.matrix);
          this.offsetFor(b, kind).negate();
          this.inverse.makeTranslation(
            this.offset.x,
            this.offset.y,
            this.offset.z,
          );
          this.matrix
            .multiply(this.inverse)
            .decompose(b.anchor.position, b.anchor.quaternion, this.scale);
          b.anchor.scale.setScalar(windowScale(this.scale.x));
        } else b.anchor.scale.setScalar(windowScale(b.anchor.scale.x));
      }
      this.sync(b);
      for (const e of b.targets) {
        e.setValue(SpatialWindow, "held", e === b.owner);
        e.setValue(SpatialWindow, "scale", b.anchor.scale.x);
      }
    }
  }
}
