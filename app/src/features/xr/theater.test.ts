import { describe, expect, it, vi } from "vitest";
import { applyViewingMode, viewingPolicy } from "./theater";

describe("viewing modes", () => {
  it("uses an opaque enclosed room for an immersive theater", () => {
    expect(viewingPolicy("theater")).toEqual({
      roomVisible: true,
      transparent: false,
      sessionMode: "immersive-vr",
    });
  });
  it("requests AR and clears the room for camera passthrough", () => {
    expect(viewingPolicy("passthrough")).toEqual({
      roomVisible: false,
      transparent: true,
      sessionMode: "immersive-ar",
    });
  });
  it("removes the room and background for AR and restores both for VR", () => {
    const scene = { background: "team blue" as string | null };
    const room = { visible: true };
    const renderer = { setClearAlpha: vi.fn() };
    applyViewingMode("passthrough", scene, room, renderer, "team blue");
    expect(scene.background).toBeNull();
    expect(room.visible).toBe(false);
    expect(renderer.setClearAlpha).toHaveBeenLastCalledWith(0);
    applyViewingMode("theater", scene, room, renderer, "team red");
    expect(scene.background).toBe("team red");
    expect(room.visible).toBe(true);
    expect(renderer.setClearAlpha).toHaveBeenLastCalledWith(1);
  });
});

it("removes the cinema for minimal practice while keeping passthrough transparent", () => {
  expect(viewingPolicy("theater", true)).toEqual({
    roomVisible: false,
    transparent: false,
    sessionMode: "immersive-vr",
  });
  expect(viewingPolicy("passthrough", true)).toEqual({
    roomVisible: false,
    transparent: true,
    sessionMode: "immersive-ar",
  });
});
