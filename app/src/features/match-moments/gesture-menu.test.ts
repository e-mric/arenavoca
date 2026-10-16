import { expect, it } from "vitest";
import { GestureMenu } from "./gesture-menu";
const observe = (m: GestureMenu, up: boolean, tracked = true, ticks = 5) => {
  for (let i = 0; i < ticks; i++) m.observe(up, tracked, 0.1);
};
it("requires a deliberate hold and tolerates brief movement before hiding", () => {
  const m = new GestureMenu();
  observe(m, true, true, 2);
  expect(m.visible).toBe(false);
  observe(m, false, true, 1);
  observe(m, true, true, 4);
  expect(m.visible).toBe(true);
  m.more = true;
  observe(m, false, true, 2);
  expect(m.visible).toBe(true);
  observe(m, false, true, 3);
  expect(m.visible).toBe(false);
  expect(m.more).toBe(false);
});
it("recovers from tracking loss, resetting expanded tools on controller reopen", () => {
  const m = new GestureMenu();
  observe(m, true);
  m.more = true;
  observe(m, false, false, 3);
  expect(m.visible).toBe(true);
  observe(m, false, false, 5);
  expect(m.visible).toBe(false);
  m.toggle();
  expect(m.visible).toBe(true);
  expect(m.more).toBe(false);
  m.toggle();
  expect(m.visible).toBe(false);
});
it("invalid or long frame gaps cannot instantly trigger a gesture", () => {
  const m = new GestureMenu();
  for (const dt of [NaN, Infinity, -1, 0, 30]) m.observe(true, true, dt);
  expect(m.visible).toBe(false);
});
