import type { Experience } from "../session/experience";
/** Accessible select/place alternative, sharing the headset's action state. */
export function bindTabletopDesktop(e: Experience, host: HTMLElement) {
  const panel = document.createElement("section");
  panel.id = "tabletop-practice";
  panel.hidden = true;
  panel.innerHTML = `<p>TABLETOP / AUTHORED PRACTICE</p><h3 data-prompt></h3><p data-hint></p><div class="controls"><button id="table-ball">Select ball</button><button id="table-teammate">Pass to teammate</button><button id="table-goal">Shoot at goal</button></div><p data-feedback role="status"></p><div class="controls"><button id="table-translation">Translation</button><button id="table-primary">Reset ball</button><button id="table-cards">Moment cards</button><button id="table-atmosphere">Switch to Minimal</button><button id="table-dismiss">Close lab</button></div><small>In Quest: grab either player to arrange the play. Pull the ball away from your target and release when the aim line appears. Turn the card over for English. You can also select the ball and then a target. Move and resize the table using its handles. Spanish review pending.</small>`;
  host.after(panel);
  const find = (id: string) => panel.querySelector<HTMLElement>(id)!;
  const p = e.lab.tabletop;
  const bind = (id: string, fn: () => unknown) =>
    find(id).addEventListener("click", () => void fn());
  bind("#table-ball", () => p.pickBall());
  bind("#table-teammate", () => p.choose("teammate"));
  bind("#table-goal", () => p.choose("goal"));
  bind("#table-translation", () => {
    p.translation = !p.translation;
  });
  bind("#table-primary", () => p.primary());
  bind("#table-cards", () => e.lab.browse());
  bind("#table-atmosphere", () => p.atmosphere.toggle());
  bind("#table-dismiss", () => e.closeLab());
  const text = (id: string, value: string) => {
    if (find(id).textContent !== value) find(id).textContent = value;
  };
  return () => {
    panel.hidden = !e.lab.open || !p.active || !e.session.matchActive;
    if (panel.hidden) return;
    text("[data-prompt]", p.spanish);
    text("[data-hint]", p.translation ? p.english : "Translation is optional");
    text("[data-feedback]", p.message);
    text("#table-primary", p.primaryLabel);
    text("#table-atmosphere", p.atmosphere.mode === "team" ? "Switch to Minimal" : "Team atmosphere");
    panel.dataset.atmosphere = p.atmosphere.mode;
    panel.dataset.celebrating = String(p.atmosphere.celebrating);
    (find("#table-primary") as HTMLButtonElement).disabled =
      p.phase === "moving";
    (find("#table-ball") as HTMLButtonElement).disabled =
      p.phase === "moving" || p.phase === "feedback";
    find("#table-ball").setAttribute(
      "aria-pressed",
      String(p.phase === "aiming"),
    );
  };
}
