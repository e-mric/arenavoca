import type { Group, World } from "@iwsdk/core";
import { VisibilityState } from "@iwsdk/core";
import { ArenaReveal, arenaRevealProgress } from "./arena-motion";

/** Uses only the XR presentation clock. No media commands or camera transforms. */
export function attachArenaReveal(
  world: World,
  arena: Group,
  onboarding: () => boolean,
) {
  const motion = new ArenaReveal();
  const bowl = arena.getObjectByName("Arena bowl")!;
  const play = arena.getObjectByName("Coral play")!;
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  arena.visible = false;
  const reset = () => {
    motion.update(0, false, false);
    arena.visible = false;
  };
  const unsubscribe = world.onXRFrame((_frame, delta) => {
    motion.update(
      delta,
      true,
      onboarding() && world.visibilityState.peek() === VisibilityState.Visible,
    );
    const progress = arenaRevealProgress(motion.elapsed, preference.matches);
    arena.visible = motion.visible;
    arena.rotation.x = 0.72 * progress;
    bowl.scale.z = 0.025 + 0.975 * progress;
    play.position.z = 0.025 + 0.295 * progress;
  });
  world.renderer.xr.addEventListener("sessionend", reset);
  world.addCleanup(() => {
    unsubscribe();
    world.renderer.xr.removeEventListener("sessionend", reset);
  });
}
