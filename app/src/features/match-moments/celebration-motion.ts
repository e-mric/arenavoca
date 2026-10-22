import type { Object3D } from "@iwsdk/core";
/** The Blender exporter bakes Y-up coordinates into these shoulder pivots. */
export class CelebrationMotion {
  private readonly leftRest: number;
  private readonly rightRest: number;
  private readonly headY: number;
  private readonly baseY: number;
  constructor(
    private readonly left: Object3D,
    private readonly right: Object3D,
    private readonly head: Object3D,
    private readonly player: Object3D,
  ) {
    this.leftRest = left.rotation.z;
    this.rightRest = right.rotation.z;
    this.headY = head.rotation.y;
    this.baseY = player.position.y;
  }
  update(celebrating: boolean, age: number, reduced: boolean) {
    const ease = celebrating ? Math.min(1, age / 0.35) : 0;
    const wave = celebrating && !reduced ? Math.sin(age * 9) * 0.1 : 0;
    this.left.rotation.z = this.leftRest - 0.65 * ease + wave;
    this.right.rotation.z = this.rightRest + 2.25 * ease - wave;
    this.head.rotation.y = this.headY + wave * 0.35;
    this.player.position.y =
      this.baseY +
      (celebrating && !reduced ? Math.abs(Math.sin(age * 7)) * 0.025 : 0);
  }
}
