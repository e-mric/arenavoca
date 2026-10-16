interface SessionEvents {
  addEventListener(
    type: "sessionstart" | "sessionend",
    listener: () => void,
  ): void;
  removeEventListener(
    type: "sessionstart" | "sessionend",
    listener: () => void,
  ): void;
}
/** Session boundaries, rather than visibility alone, determine whether the web launcher is hidden. */
export function bindSessionPage(
  events: SessionEvents,
  classes: Pick<DOMTokenList, "add" | "remove">,
  onEnd: () => void,
) {
  const start = () => classes.add("immersive");
  const end = () => {
    classes.remove("immersive");
    onEnd();
  };
  events.addEventListener("sessionstart", start);
  events.addEventListener("sessionend", end);
  return () => {
    events.removeEventListener("sessionstart", start);
    events.removeEventListener("sessionend", end);
    classes.remove("immersive");
  };
}
