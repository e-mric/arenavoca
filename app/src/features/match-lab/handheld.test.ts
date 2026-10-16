import { afterEach, expect, it, vi } from "vitest";
import { Group, Mesh, MeshBasicMaterial, type World } from "@iwsdk/core";
import { attachHandheldCard } from "./handheld";
import { MomentCards } from "./cards";
import type { Experience } from "../session/experience";
import type { SpatialWindows } from "../spatial-windows/windows";

afterEach(() => vi.unstubAllGlobals());

it("leaves the desktop card and revealed face pinned while the spatial runtime updates outside XR", () => {
  const context = {
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: () => ({ width: 10 }),
  };
  vi.stubGlobal("document", {
    createElement: () => ({ getContext: () => context }),
  });
  const card = new Group();
  for (const name of [
    "Spanish face",
    "English face",
    "Moment illustration or replay",
  ]) {
    const mesh = new Mesh(undefined, new MeshBasicMaterial());
    mesh.name = name;
    card.add(mesh);
  }
  const cleanup: (() => void)[] = [];
  const world = {
    requireSceneObject: () => card,
    addCleanup: (fn: () => void) => cleanup.push(fn),
    renderer: { xr: { isPresenting: false } },
    player: { head: new Group() },
  } as unknown as World;
  const cards = new MomentCards();
  cards.flip();
  const selected = cards.card.id;
  const e = {
    lab: { cards, open: true, view: "cards" },
    session: { matchActive: true },
  } as unknown as Experience;
  const windows = { bind: vi.fn() } as unknown as SpatialWindows;
  const update = attachHandheldCard(world, e, windows);
  update();
  update();
  expect(cards.card.id).toBe(selected);
  expect(cards.flipped).toBe(true);
  expect(card.visible).toBe(false);
  cleanup.forEach((fn) => fn());
});
