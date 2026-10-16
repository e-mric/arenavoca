import { afterEach, describe, expect, it, vi } from "vitest";
import { enableLauncher } from "./launcher";

afterEach(() => vi.unstubAllGlobals());
function fixture() {
  const nodes: Record<string, any> = {
    "viewer-room": { checked: true },
    "viewer-quiet": { checked: false },
    "enter-theater": {},
    "launch-support": {},
  };
  // Mirror the browser's mutually exclusive radio selection.
  let room = true;
  Object.defineProperty(nodes["viewer-room"], "checked", {
    get: () => room,
    set: (v) => {
      room = v;
    },
  });
  Object.defineProperty(nodes["viewer-quiet"], "checked", {
    get: () => !room,
    set: (v) => {
      room = !v;
    },
  });
  vi.stubGlobal("document", { getElementById: (id: string) => nodes[id] });
  return nodes;
}
describe("immersive launcher", () => {
  it("defaults to passthrough and launches the selected space without playback commands", () => {
    const n = fixture(),
      launch = vi.fn();
    enableLauncher(true, true, launch);
    n["enter-theater"].onclick();
    expect(launch).toHaveBeenLastCalledWith("passthrough");
    n["viewer-quiet"].checked = true;
    n["enter-theater"].onclick();
    expect(launch.mock.calls).toEqual([["passthrough"], ["theater"]]);
  });
  it("selects quiet space when only VR is available", () => {
    const n = fixture(),
      launch = vi.fn();
    enableLauncher(true, false, launch);
    expect(n["viewer-room"].disabled).toBe(false);
    n["enter-theater"].onclick();
    expect(launch).toHaveBeenCalledWith("theater");
  });
  it("allows passthrough on AR-only devices", () => {
    const n = fixture(),
      launch = vi.fn();
    enableLauncher(false, true, launch);
    expect(n["enter-theater"].disabled).toBe(false);
    expect(n["viewer-quiet"].disabled).toBe(false);
    n["enter-theater"].onclick();
    expect(launch).toHaveBeenCalledWith("passthrough");
  });
  it("explains unavailable XR and guards against unsupported launch", () => {
    const n = fixture(),
      launch = vi.fn();
    enableLauncher(false, false, launch);
    expect(n["enter-theater"].disabled).toBe(true);
    expect(n["launch-support"].textContent).toContain("Quest Browser");
    n["enter-theater"].onclick();
    expect(launch).not.toHaveBeenCalled();
  });
});

it("lets desktop users choose a space and explains why entry is unavailable", () => {
  const n = fixture(),
    launch = vi.fn();
  enableLauncher(false, false, launch);
  n["viewer-quiet"].checked = true;
  n["viewer-quiet"].onchange();
  expect(n["launch-support"].textContent).toContain("Quiet space selected");
  expect(n["enter-theater"].disabled).toBe(true);
  n["viewer-room"].checked = true;
  n["viewer-room"].onchange();
  expect(n["launch-support"].textContent).toContain(
    "My room · Passthrough selected",
  );
  expect(launch).not.toHaveBeenCalled();
});
it("rechecks launch availability when the selected mode changes", () => {
  const n = fixture(),
    launch = vi.fn();
  enableLauncher(true, false, launch);
  expect(n["enter-theater"].disabled).toBe(false);
  n["viewer-room"].checked = true;
  n["viewer-room"].onchange();
  expect(n["enter-theater"].disabled).toBe(true);
  n["enter-theater"].onclick();
  expect(launch).not.toHaveBeenCalled();
  n["viewer-quiet"].checked = true;
  n["viewer-quiet"].onchange();
  n["enter-theater"].onclick();
  expect(launch).toHaveBeenCalledWith("theater");
});
