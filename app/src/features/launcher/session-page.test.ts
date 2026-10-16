import { expect, it, vi } from "vitest";
import { bindSessionPage } from "./session-page";
it("restores the launcher on session exit and removes listeners on teardown", () => {
  const events = new EventTarget(),
    state = new Set<string>(),
    end = vi.fn();
  const dispose = bindSessionPage(
    events,
    {
      add: (...names) => names.forEach((n) => state.add(n)),
      remove: (...names) => names.forEach((n) => state.delete(n)),
    },
    end,
  );
  events.dispatchEvent(new Event("sessionstart"));
  expect(state.has("immersive")).toBe(true);
  events.dispatchEvent(new Event("sessionend"));
  expect(state.has("immersive")).toBe(false);
  expect(end).toHaveBeenCalledTimes(1);
  events.dispatchEvent(new Event("sessionstart"));
  dispose();
  expect(state.has("immersive")).toBe(false);
  events.dispatchEvent(new Event("sessionstart"));
  events.dispatchEvent(new Event("sessionend"));
  expect(state.has("immersive")).toBe(false);
  expect(end).toHaveBeenCalledTimes(1);
});
