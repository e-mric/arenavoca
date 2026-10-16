import { expect, it } from "vitest";
import { GestureMenu } from "./gesture-menu";
const observe = (m: GestureMenu, up: boolean, tracked = true, ticks = 5) => {
  for (let i = 0; i < ticks; i++) m.observe(up, tracked, 0.1);
};
it("requires a deliberate palm hold, then stays open through turning away", () => {
  const m = new GestureMenu();
  observe(m, true, true, 2);
  expect(m.visible).toBe(false);
  observe(m, false, true, 1);
  observe(m, true, true, 4);
  expect(m.visible).toBe(true);
  m.more = true;
  observe(m, false, true, 100);
  expect(m.visible).toBe(true);
  expect(m.more).toBe(true);
});
it("keeps the menu and expanded tools available when hands lose tracking", () => {
  const m = new GestureMenu();
  observe(m, true);
  m.more = true;
  observe(m, false, false, 100);
  expect(m.visible).toBe(true);
  expect(m.more).toBe(true);
  m.hide();
  expect(m.visible).toBe(false);
  expect(m.more).toBe(false);
});
it("Close stays closed until a new palm-away then palm-up gesture", () => {
  const m = new GestureMenu();
  observe(m, true);
  m.hide();
  observe(m, true, true, 20);
  expect(m.visible).toBe(false);
  observe(m, false, false, 10);
  observe(m, true);
  expect(m.visible).toBe(false);
  observe(m, false);
  observe(m, true, true, 2);
  expect(m.visible).toBe(false);
  observe(m, true, true, 2);
  expect(m.visible).toBe(true);
});
it("controller toggle explicitly closes and reopens a compact menu", () => {
  const m = new GestureMenu();
  m.toggle();
  expect(m.visible).toBe(true);
  m.more = true;
  m.toggle();
  expect(m.visible).toBe(false);
  m.toggle();
  expect(m.visible).toBe(true);
  expect(m.more).toBe(false);
});
it("invalid or long frame gaps cannot instantly trigger a gesture", () => {
  const m = new GestureMenu();
  for (const dt of [NaN, Infinity, -1, 0, 30]) m.observe(true, true, dt);
  expect(m.visible).toBe(false);
});
