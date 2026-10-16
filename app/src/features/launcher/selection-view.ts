import type { Content } from "../content/model";
import type { Sport, Team } from "../theme/team-theme";
import { element } from "../../shared/dom";
import { selectionDetails } from "./selection";

export function bindSelectionPreview(content: Content) {
  let previous = "";
  return (sport: Sport, team: Team, chants: boolean, loaded: boolean) => {
    const key = `${sport}/${team}/${chants}/${loaded}`;
    if (key === previous) return;
    previous = key;
    const detail = selectionDetails(content, sport, team);
    element("selection-preview").hidden = !loaded;
    element("selection-title").textContent = detail.title;
    element("selection-effect").textContent = detail.effect;
    element("selection-source").textContent = detail.source;
    element("selection-spanish").textContent = detail.spanish;
    element("selection-english").textContent = detail.english;
    element("selection-shirt").hidden = sport !== "football";
    element("selection-car").hidden = sport !== "f1";
    const preview = element("selection-preview");
    preview.style.setProperty("--kit-shirt", detail.shirt);
    preview.style.setProperty("--kit-trim", detail.trim);
    element("karaoke-toggle").hidden = !loaded || !detail.chantAvailable;
    element("chant-availability").textContent = detail.chantAvailable
      ? chants
        ? "Lyrics will appear at 00:21 in the sample. Original text demo; no chant audio."
        : "Optional lyric demo available at 00:21 in this sample."
      : "Chant lyrics are not available for this team and recording.";
    element("sport-availability").textContent = content.manualPractice
      ? `This recording is ${content.sport === "f1" ? "F1" : "football"}; sport selection cannot change its footage.`
      : "Sport cards preview colours and vocabulary. The sample remains a football clip.";
  };
}
