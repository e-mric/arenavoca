import type { Experience } from "../session/experience";
import { bindTabletopDesktop } from "./tabletop-desktop";
import { cutback } from "./lab";
import { labPrimaryLabel, labStep } from "./presentation";
/** Browser fallback exercises the same decisions as the spatial board. */
export function bindLabDesktop(e: Experience) {
  const launch = document.createElement("button");
  launch.id = "match-lab-open";
  launch.textContent = "Match Lab · Alba's cutback";
  document.getElementById("coach-open")!.after(launch);
  const panel = document.createElement("section");
  panel.id = "match-lab";
  panel.hidden = true;
  panel.innerHTML = `<h2>Match Lab · Alba's cutback</h2><p data-step></p><h3 data-face>${cutback.spanish}</h3><p data-translation>${cutback.english}</p><p data-direction></p><img data-art alt="Illustrated sporting action" style="width:100%;border-radius:16px"><div data-replay></div><div class="lab-desktop-board"><span class="lab-goal lab-goal-left">GOAL</span><span class="lab-goal lab-goal-right">GOAL</span><button id="lab-ball" aria-label="Select ball">●</button><button id="lab-player-0">A</button><button id="lab-player-1">B</button><button id="lab-player-2">C</button></div><p data-message role="status"></p><div data-card-nav class="controls"><button id="lab-prev-card">Previous</button><button id="lab-flip-card">Flip card</button><button id="lab-next-card">Next</button><button id="lab-read-story">Read story</button></div><div class="controls"><button id="lab-tabletop">Tabletop: pass + shoot</button><button id="lab-cards">Moment cards</button><button id="lab-watch">Watch moment</button><button id="lab-speak">Hear phrase</button><button id="lab-continue">Try the pass</button><button id="lab-show">Show movement</button><button id="lab-store">Save phrase</button><button id="lab-dismiss">Close lab</button></div><div data-recognition hidden><p data-analysis-provider></p><p data-analysis-status role="status"></p><div class="controls"><button id="lab-analysis">Start analysis</button><button id="lab-drafts">New drafts (0)</button></div></div><small>Teaching diagram / Spanish and audio review pending</small>`;
  document.getElementById("companion")!.append(panel);
  const renderTabletop = bindTabletopDesktop(e, panel);
  const find = (selector: string) =>
    panel.querySelector<HTMLElement>(selector)!;
  const bind = (id: string, action: () => unknown) =>
    find(id).addEventListener("click", () => void action());
  launch.addEventListener("click", () => e.openLab());
  bind("[data-art]", () => e.changeLabCard("flip"));
  bind("#lab-prev-card", () => e.changeLabCard("previous"));
  bind("#lab-next-card", () => e.changeLabCard("next"));
  bind("#lab-flip-card", () => e.changeLabCard("flip"));
  bind("#lab-read-story", () => e.changeLabCard("story"));
  bind("#lab-tabletop", () => e.openTabletop());
  bind("#lab-cards", () => e.changeLabCard("browse"));
  bind("#lab-ball", () => e.lab.pickBall());
  for (let i = 0; i < 3; i++) bind(`#lab-player-${i}`, () => e.lab.choose(i));
  bind("#lab-watch", () => e.replayLab());
  bind("#lab-speak", () => e.listenLab());
  bind("#lab-continue", () => e.labPrimary());
  bind("#lab-show", () => {
    e.labReplay?.stop();
    e.lab.demonstrate();
  });
  bind("#lab-store", () => e.saveLab());
  bind("#lab-dismiss", () => e.closeLab());
  bind("#lab-analysis", () => e.toggleRecognition());
  bind("#lab-drafts", () => e.showRecognitionDrafts());
  const set = (selector: string, value: string) => {
    const n = find(selector);
    if (n.textContent !== value) n.textContent = value;
  };
  return () => {
    const lab = e.lab;
    launch.hidden = !e.labAvailable || !e.session.matchActive;
    renderTabletop();
    panel.hidden = !lab.open || lab.tabletop.active;
    if (!lab.open) return;
    find("[data-recognition]").hidden = !e.recognitionEnabled;
    set("[data-analysis-provider]", e.recognition.notice);
    set("[data-analysis-status]", e.recognition.status);
    set(
      "#lab-analysis",
      e.recognition.active ? "Stop analysis" : e.recognition.startLabel,
    );
    set("#lab-drafts", `New drafts (${lab.cards.draftCount})`);
    (find("#lab-drafts") as HTMLButtonElement).disabled = !lab.cards.draftCount;
    const cards = lab.view === "cards";
    set("[data-step]", cards ? lab.cards.label : labStep(lab));
    set(
      "[data-face]",
      cards
        ? lab.cards.flipped
          ? lab.cards.english
          : lab.cards.spanish
        : cutback.spanish,
    );
    set(
      "[data-translation]",
      cards
        ? lab.cards.flipped
          ? "Translation"
          : "Flip the card to reveal the translation"
        : cutback.english,
    );
    find("[data-translation]").style.visibility =
      cards || lab.translation ? "visible" : "hidden";
    find("[data-card-nav]").hidden = !cards;
    find("#lab-cards").hidden = cards;
    find("#lab-show").hidden = cards;
    const art = find("[data-art]") as HTMLImageElement;
    const src = `${import.meta.env.BASE_URL}${lab.cards.artworkPath}`;
    if (art.getAttribute("src") !== src) art.src = src;
    art.hidden = !cards || !!e.labReplay?.visible;
    set("#lab-read-story", lab.cards.storyMode ? "Single card" : "Read story");
    set("#lab-flip-card", lab.cards.flipped ? "Spanish side" : "Flip card");
    set(
      "[data-direction]",
      cards
        ? `${lab.cards.card.draft ? "AI DRAFT / review needed" : lab.cards.generated ? "AI-generated · corrected" : "Prepared moment"} / match clock ${lab.cards.card.evidence.matchClock}`
        : `Attack ${lab.arrangement.attack === 1 ? "RIGHT →" : "← LEFT"}. Select the ball, then a teammate.`,
    );
    set(
      "[data-message]",
      e.labReplay?.error ||
        lab.notice ||
        (e.labReplay?.visible
          ? e.labReplay.status
          : cards
            ? lab.saved
              ? "Phrase saved on this device."
              : lab.cards.card.draft
                ? "Unreviewed AI output. Check the replay; timing and Spanish may be wrong."
                : "Prepared from commentary and frames. Spanish review pending."
            : lab.message),
    );
    set("#lab-continue", cards ? "Practise cutback" : labPrimaryLabel(lab));
    set("#lab-store", lab.saved ? "Saved on this device" : "Save phrase");
    if (
      e.labReplay?.video &&
      !find("[data-replay]").contains(e.labReplay.video)
    )
      find("[data-replay]").append(e.labReplay.video);
    find("[data-replay]").hidden = !e.labReplay?.visible;
    find(".lab-desktop-board").hidden =
      cards || lab.phase === "observe" || !!e.labReplay?.visible;
    const [x, y] = lab.arrangement.ball;
    const end =
      lab.selected === null
        ? lab.arrangement.ball
        : lab.arrangement.players[lab.selected];
    const place = (node: HTMLElement, px: number, py: number) => {
      node.style.left = `${((px + 0.51) / 1.02) * 100}%`;
      node.style.top = `${((0.31 - py) / 0.62) * 100}%`;
    };
    place(
      find("#lab-ball"),
      x + (end[0] - x) * lab.motion,
      y + (end[1] - y) * lab.motion,
    );
    for (let i = 0; i < 3; i++) {
      const node = find(`#lab-player-${i}`);
      place(node, lab.arrangement.players[i][0], lab.arrangement.players[i][1]);
      node.setAttribute("aria-label", `Teammate ${"ABC"[i]}`);
    }
    find("#lab-ball").setAttribute("aria-pressed", String(lab.armed));
    (find("#lab-continue") as HTMLButtonElement).disabled =
      lab.phase === "feedback" &&
      lab.correct &&
      !lab.demonstration &&
      lab.motion < 1;
  };
}
