import { expect, it, vi } from "vitest";
vi.mock("@iwsdk/core", () => ({ VisibilityState: { Visible: "visible" } }));
import { attachArenaReveal } from "./arena-reveal";
import type { Group, World } from "@iwsdk/core";

it("animates only the logo, hides during playback, and removes its callbacks", () => {
  let frame: (_frame: unknown, delta: number) => void = () => {};
  let cleanup = () => {};
  let end = () => {};
  let onboarding = true;
  const preference = { matches: false };
  vi.stubGlobal("window", { matchMedia: () => preference });
  const unsubscribe = vi.fn();
  const removeEventListener = vi.fn();
  const world = {
    visibilityState: { peek: () => "visible" },
    onXRFrame: (fn: typeof frame) => {
      frame = fn;
      return unsubscribe;
    },
    renderer: {
      xr: {
        addEventListener: (_: string, fn: () => void) => {
          end = fn;
        },
        removeEventListener,
      },
    },
    addCleanup: (fn: () => void) => {
      cleanup = fn;
    },
  };
  const bowl = { scale: { z: 1 } };
  const play = { position: { z: 0.32 } };
  const arena = {
    visible: true,
    rotation: { x: 0 },
    getObjectByName: (name: string) => (name === "Arena bowl" ? bowl : play),
  };
  try {
    attachArenaReveal(
      world as unknown as World,
      arena as unknown as Group,
      () => onboarding,
    );
    expect(arena.visible).toBe(false);
    frame(null, 0.01);
    expect(arena.visible).toBe(true);
    expect(bowl.scale.z).toBe(0.025);
    for (let i = 0; i < 50; i++) frame(null, 0.1);
    expect(bowl.scale.z).toBe(1);
    expect(arena.rotation.x).toBe(0.72);
    expect(play.position.z).toBeCloseTo(0.32);
    onboarding = false;
    frame(null, 0.1);
    expect(arena.visible).toBe(false);
    end();
    onboarding = true;
    preference.matches = true;
    frame(null, 0.01);
    expect(arena.visible).toBe(true);
    expect(bowl.scale.z).toBe(1);
    cleanup();
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(removeEventListener).toHaveBeenCalledWith("sessionend", end);
  } finally {
    vi.unstubAllGlobals();
  }
});
