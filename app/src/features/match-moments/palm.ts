import { Quaternion, Vector3 } from "@iwsdk/core";
/** Read an open palm facing upward. Left hand wins; either hand works when used alone. */
export class PalmReader {
  readonly position = new Vector3();
  tracked = false;
  up = false;
  private wrist = new Vector3();
  private index = new Vector3();
  private pinky = new Vector3();
  private tip = new Vector3();
  private orientation = new Quaternion();
  readonly normal = new Vector3();
  read(frame: XRFrame, space: XRReferenceSpace) {
    this.tracked = this.up = false;
    const sources = frame.session.inputSources;
    let source: XRInputSource | undefined;
    for (const s of sources)
      if (s.hand && (!source || s.handedness === "left")) source = s;
    if (!source?.hand) return;
    if (
      !this.joint(frame, space, source, "wrist", this.wrist) ||
      !this.joint(
        frame,
        space,
        source,
        "index-finger-phalanx-proximal",
        this.index,
      ) ||
      !this.joint(
        frame,
        space,
        source,
        "pinky-finger-phalanx-proximal",
        this.pinky,
      ) ||
      !this.joint(frame, space, source, "middle-finger-tip", this.tip)
    )
      return;
    this.tracked = true;
    this.position
      .copy(this.wrist)
      .add(this.index)
      .add(this.pinky)
      .multiplyScalar(1 / 3);
    // WebXR joint -Y points out of the palm, for both hands. A triangle
    // winding guess can select the back of the hand instead.
    // https://www.w3.org/TR/webxr-hand-input-1/#xrjointspace
    this.normal.set(0, -1, 0).applyQuaternion(this.orientation);
    // A curled/gripping hand must not summon the menu while holding a card.
    this.up = this.normal.y > 0.65 && this.tip.distanceTo(this.wrist) > 0.11;
  }
  /** Keep the invitation on the inside of the hand even when the palm tilts. */
  placeMenu(target: Vector3) {
    return target.copy(this.position).addScaledVector(this.normal, 0.08);
  }
  private joint(
    frame: XRFrame,
    space: XRReferenceSpace,
    source: XRInputSource,
    name: XRHandJoint,
    v: Vector3,
  ) {
    const j = source.hand!.get(name);
    const pose = j && frame.getJointPose?.(j, space);
    if (!pose) return false;
    if (name === "wrist") {
      const q = pose.transform.orientation;
      if (!q || !Number.isFinite(q.x + q.y + q.z + q.w)) return false;
      this.orientation.set(q.x, q.y, q.z, q.w);
      if (this.orientation.lengthSq() < 0.000001) return false;
      this.orientation.normalize();
    }
    v.set(
      pose.transform.position.x,
      pose.transform.position.y,
      pose.transform.position.z,
    );
    return true;
  }
}
