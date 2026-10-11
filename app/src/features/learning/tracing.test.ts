import { describe, it, expect } from "vitest";
import { PassTrace, revealedChunks, routePoint } from "./tracing";
import { diagramPoint } from "./diagram";
const route = [
  [0.2, 0.8],
  [0.8, 0.2],
] as const;
const trace = () => new PassTrace(route);
const sample = (t: PassTrace, p: number, tracked = true, depth = 0) =>
  t.sample({ point: routePoint(route, p), tracked, depth });
describe("deliberate continuous pass tracing", () => {
  it("resting and moving hands never arm tracing", () => {
    const t = trace();
    sample(t, 0.4);
    expect(t.progress).toBe(0);
  });
  it("requires starting at the beginning", () => {
    const t = trace();
    t.start();
    sample(t, 0.5);
    expect(t.progress).toBe(0);
  });
  it("cannot teleport to the end", () => {
    const t = trace();
    t.start();
    sample(t, 0);
    sample(t, 1);
    expect(t.progress).toBe(0);
  });
  it("advances monotonically inside the corridor", () => {
    const t = trace();
    t.start();
    for (let p = 0; p <= 0.6; p += 0.1) sample(t, p);
    sample(t, 0.3);
    expect(t.progress).toBeCloseTo(0.6);
  });
  it("freezes on tracking loss and ignores depth outside the plane", () => {
    const t = trace();
    t.start();
    sample(t, 0);
    sample(t, 0.1);
    sample(t, 0.2, false);
    sample(t, 0.2, true, 0.2);
    expect(t.progress).toBeCloseTo(0.1);
    sample(t, 0.2);
    expect(t.progress).toBeCloseTo(0.2);
  });
  it("tolerates imprecise hand placement without rewarding distant movement", () => {
    const t = trace();
    t.start();
    sample(t, 0);
    t.sample({ point: [0.28, 0.78], depth: 0, tracked: true });
    expect(t.progress).toBeGreaterThan(0);
    const before = t.progress;
    t.sample({ point: [0.8, 0.8], depth: 0, tracked: true });
    expect(t.progress).toBe(before);
  });
  it("completes a full route and reveals all sentence chunks", () => {
    const t = trace();
    t.start("left");
    for (let i = 0; i <= 10; i++) sample(t, i / 10);
    expect(t.progress).toBe(1);
    expect(t.armed).toBe(false);
    expect(t.hand).toBe("left");
    expect(revealedChunks(t.progress)).toBe(3);
    t.reset();
    expect(t.progress).toBe(0);
  });
  it("reveals phrase progressively", () => {
    expect([0, 0.1, 0.5, 1].map(revealedChunks)).toEqual([0, 1, 2, 3]);
  });
  it("maps diagram margins and multi-segment routes", () => {
    expect(diagramPoint(0.04, 0.08)).toEqual([0, 0]);
    expect(
      routePoint(
        [
          [0, 0],
          [1, 0],
          [1, 1],
        ],
        0.75,
      ),
    ).toEqual([1, 0.5]);
  });
});
