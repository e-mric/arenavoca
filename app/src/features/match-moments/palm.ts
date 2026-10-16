import { Vector3 } from "@iwsdk/core";
/** Read an open palm facing upward. Left hand wins; either hand works when used alone. */
export class PalmReader {
  readonly position = new Vector3();
  tracked = false;
  up = false;
  private wrist = new Vector3();
  private index = new Vector3();
  private pinky = new Vector3();
  private tip = new Vector3();
  private across = new Vector3();
  private normal = new Vector3();
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
        "index-finger-metacarpal",
        this.index,
      ) ||
      !this.joint(
        frame,
        space,
        source,
        "pinky-finger-metacarpal",
        this.pinky,
      ) ||
      !this.joint(frame, space, source, "middle-finger-tip", this.tip)
    )
      return;
    this.tracked = true;
    this.position.copy(this.wrist);
    this.across.copy(this.pinky).sub(this.wrist);
    this.normal.copy(this.index).sub(this.wrist).cross(this.across);
    if (source.handedness === "right") this.normal.negate();
    if (this.normal.lengthSq() < 0.00000001) return;
    this.normal.normalize();
    // A curled/gripping hand must not summon the menu while holding a card.
    this.up = this.normal.y > 0.65 && this.tip.distanceTo(this.wrist) > 0.11;
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
    v.set(
      pose.transform.position.x,
      pose.transform.position.y,
      pose.transform.position.z,
    );
    return true;
  }
}
