/** Targets are captured once in XR reference-space metres, not chased by the head. */
export const CELEBRATION_REACH = {
  side: 0.29,
  forward: 0.5,
  height: -0.02,
  radius: 0.15,
};
export class CelebrationPose {
  tracked = false;
  raised = false;
  leftInPlace = false;
  rightInPlace = false;
  anchored = false;
  x = 0;
  y = 0;
  z = 0;
  yaw = 0;
  private invitation = 0;
  clear() {
    this.tracked = this.raised = this.leftInPlace = this.rightInPlace = false;
    this.anchored = false;
    this.invitation = 0;
  }
  read(frame: XRFrame, space: XRReferenceSpace, invitation = 0) {
    this.tracked = this.raised = this.leftInPlace = this.rightInPlace = false;
    const viewer = frame.getViewerPose(space)?.transform;
    const head = viewer?.position;
    if (!head || !Number.isFinite(head.x + head.y + head.z)) return;
    if (!invitation) {
      this.anchored = false;
      this.invitation = 0;
    } else if (this.invitation !== invitation) {
      const q = viewer!.orientation;
      if (!q || !Number.isFinite(q.x + q.y + q.z + q.w)) return;
      this.x = head.x;
      this.y = head.y;
      this.z = head.z;
      this.yaw = Math.atan2(
        2 * (q.w * q.y + q.x * q.z),
        1 - 2 * (q.x * q.x + q.y * q.y),
      );
      this.anchored = true;
      this.invitation = invitation;
    }
    let left: DOMPointReadOnly | undefined, right: DOMPointReadOnly | undefined;
    for (const source of frame.session.inputSources) {
      if (source.handedness !== "left" && source.handedness !== "right")
        continue;
      const wrist = source.hand?.get("wrist");
      const pose = source.hand
        ? wrist && frame.getJointPose?.(wrist, space)
        : source.gripSpace && frame.getPose(source.gripSpace, space);
      const p = pose?.transform?.position;
      if (!p || !Number.isFinite(p.x + p.y + p.z)) continue;
      if (source.handedness === "left") left = p;
      else right = p;
    }
    this.tracked = !!left && !!right;
    if (invitation && this.anchored) {
      this.leftInPlace = !!left && this.contains(left, -1);
      this.rightInPlace = !!right && this.contains(right, 1);
      this.raised = this.leftInPlace && this.rightInPlace;
    } else if (left && right) {
      // Observe the idle pose so already-raised hands cannot auto-complete a new cue.
      this.raised = left.y >= head.y - 0.05 && right.y >= head.y - 0.05;
    }
  }
  private contains(p: DOMPointReadOnly, side: number) {
    const c = Math.cos(this.yaw),
      s = Math.sin(this.yaw);
    const dx = p.x - this.x,
      dz = p.z - this.z;
    return (
      Math.hypot(
        c * dx - s * dz - side * CELEBRATION_REACH.side,
        p.y - this.y - CELEBRATION_REACH.height,
        s * dx + c * dz + CELEBRATION_REACH.forward,
      ) <= CELEBRATION_REACH.radius
    );
  }
}
