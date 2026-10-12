import { it, expect } from "vitest";
import { companionPlacement } from "./placement";
import { emptySnapshot } from "../progress/store";
it.each(["near", "far"] as const)(
  "%s placement keeps the companion clear of the match on either side",
  (panelDistance) => {
    for (const panelSide of ["left", "right"] as const) {
      for (const panelHeight of ["low", "high"] as const) {
        const p = companionPlacement({
          ...emptySnapshot("v1").preferences,
          panelSide,
          panelDistance,
          panelHeight,
        });
        const companionInnerEdge = (Math.abs(p.x) - p.width / 2) / -p.z;
        const matchOuterEdge = 7.29 / 2 / 5.95;
        expect(companionInnerEdge - matchOuterEdge).toBeGreaterThan(0.05);
        expect(p.z).toBeLessThan(0);
        expect(Math.sign(p.x)).toBe(panelSide === "right" ? 1 : -1);
      }
    }
  },
);
