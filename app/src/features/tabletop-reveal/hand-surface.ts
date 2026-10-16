import { Matrix4, Vector3 } from "@iwsdk/core";
import { pointInside, restingHands, type RestCandidate } from "./reveal";
/** Native WebXR observations, with all scratch objects reused between frames. */
export class HandSurfaceReader {
  readonly left = new Vector3();
  readonly right = new Vector3();
  readonly candidate: RestCandidate = {
    x: 0,
    y: 0,
    z: 0,
    yaw: 0,
    key: null,
    source: "surface",
  };
  handsTracked = false;
  handsAway = false;
  hasSurface = false;
  private inverse = new Matrix4();
  private matrix = new Matrix4();
  private l = new Vector3();
  private r = new Vector3();
  private corner = new Vector3();
  private normal = new Vector3();
  private wrist = new Vector3();
  private readonly indices = ["index-finger-tip", "middle-finger-tip"] as const;
  read(
    frame: XRFrame,
    space: XRReferenceSpace,
    calibrating: boolean,
    head: Vector3,
    lastHeight: number,
  ): RestCandidate | null {
    let left = false,
      right = false;
    this.hasSurface = false;
    for (const source of frame.session.inputSources) {
      if (
        !source.hand ||
        (source.handedness !== "left" && source.handedness !== "right")
      )
        continue;
      const target = source.handedness === "left" ? this.left : this.right;
      const a = source.hand.get(this.indices[0]),
        b = source.hand.get(this.indices[1]),
        w = source.hand.get("wrist");
      if (!a || !b || !w) continue;
      const pa = frame.getJointPose?.(a, space),
        pb = frame.getJointPose?.(b, space),
        pw = frame.getJointPose?.(w, space);
      if (!pa || !pb || !pw) continue;
      target.set(
        (pa.transform.position.x + pb.transform.position.x) / 2,
        (pa.transform.position.y + pb.transform.position.y) / 2,
        (pa.transform.position.z + pb.transform.position.z) / 2,
      );
      this.wrist.set(
        pw.transform.position.x,
        pw.transform.position.y,
        pw.transform.position.z,
      );
      // Reject a pointing/downward curled pose as a deliberate flat-hand rest.
      if (Math.abs(this.wrist.y - target.y) > 0.09) continue;
      if (source.handedness === "left") left = true;
      else right = true;
    }
    this.handsTracked = left && right;
    this.handsAway =
      this.handsTracked &&
      this.left.y > lastHeight + 0.14 &&
      this.right.y > lastHeight + 0.14;
    if (!this.handsTracked || !restingHands(this.left, this.right)) return null;
    const c = this.candidate;
    c.x = (this.left.x + this.right.x) / 2;
    c.y = (this.left.y + this.right.y) / 2;
    c.z = (this.left.z + this.right.z) / 2;
    c.yaw = Math.atan2(head.x - c.x, head.z - c.z);
    if (
      c.y < 0.35 ||
      c.y > 1.25 ||
      Math.hypot(head.x - c.x, head.z - c.z) > 1.1
    )
      return null;
    if (calibrating) {
      c.key = "hand-calibration";
      c.source = "calibrated";
      c.y -= 0.012;
      return c;
    }
    for (const plane of frame.detectedPlanes ?? []) {
      if (plane.orientation !== "horizontal") continue;
      const pose = frame.getPose(plane.planeSpace, space);
      if (!pose) continue;
      this.matrix.fromArray(pose.transform.matrix);
      this.inverse.copy(this.matrix).invert();
      this.normal.set(0, 1, 0).transformDirection(this.matrix);
      if (Math.abs(this.normal.y) < 0.97) continue;
      this.l.copy(this.left).applyMatrix4(this.inverse);
      this.r.copy(this.right).applyMatrix4(this.inverse);
      if (Math.abs(this.l.y) > 0.035 || Math.abs(this.r.y) > 0.035) continue;
      if (
        !pointInside(this.l.x, this.l.z, plane.polygon) ||
        !pointInside(this.r.x, this.r.z, plane.polygon)
      )
        continue;
      this.hasSurface = true;
      // Fit the entire .80 x .51m board, not merely the hand midpoint.
      let fits = true;
      for (const x of [-0.41, 0.41])
        for (const z of [-0.265, 0.265]) {
          this.corner
            .set(
              c.x + Math.cos(c.yaw) * x + Math.sin(c.yaw) * z,
              c.y,
              c.z - Math.sin(c.yaw) * x + Math.cos(c.yaw) * z,
            )
            .applyMatrix4(this.inverse);
          if (!pointInside(this.corner.x, this.corner.z, plane.polygon))
            fits = false;
        }
      if (!fits) continue;
      c.y = pose.transform.position.y + 0.008;
      c.key = plane;
      c.source = "surface";
      return c;
    }
    return null;
  }
}
