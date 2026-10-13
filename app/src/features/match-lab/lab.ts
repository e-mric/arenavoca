import { MomentCards } from "./cards";
import pack from "../stories/content/barca-2018-opening.json";
export const cutback = pack.cards.find((card) => card.id === "alba-cutback")!;
export type LabPoint = readonly [number, number];
export const arrangements = [
  {
    attack: 1,
    ball: [0.24, -0.16],
    players: [
      [-0.16, 0.12],
      [0.4, 0.17],
      [0.24, 0.22],
    ],
    answer: 0,
  },
  {
    attack: -1,
    ball: [-0.2, 0.02],
    players: [
      [-0.4, 0.2],
      [0.18, -0.15],
      [-0.2, -0.22],
    ],
    answer: 1,
  },
] as const;
/** No match player reference: learning can never issue playback commands. */
export class MatchLab {
  open = false;
  view: "cards" | "activity" = "cards";
  readonly cards = new MomentCards();
  round = 0;
  armed = false;
  phase: "observe" | "choose" | "feedback" | "complete" = "observe";
  selected: number | null = null;
  motion = 0;
  demonstration = false;
  saved = false;
  notice = "";
  onClose = () => {};
  message = "Watch the cutback, or go straight to the board.";
  get arrangement() {
    return arrangements[this.round];
  }
  get correct() {
    return this.selected === this.arrangement.answer;
  }
  get translation() {
    return (
      this.phase === "observe" ||
      this.phase === "feedback" ||
      this.phase === "complete"
    );
  }
  show() {
    this.notice = "";
    this.open = true;
  }
  browse() {
    this.view = "cards";
    this.armed = false;
  }
  close() {
    this.open = false;
    this.armed = false;
    this.onClose();
  }
  begin() {
    if (!this.open) return;
    this.notice = "";
    this.view = "activity";
    this.phase = "choose";
    this.armed = false;
    this.selected = null;
    this.motion = 0;
    this.demonstration = false;
    this.message =
      "Select the ball, then a teammate. Follow the direction of attack.";
  }
  pickBall() {
    if (!this.open || this.phase !== "choose" || this.demonstration) return;
    this.armed = true;
    this.message = "Ball selected. Send it to A, B or C.";
  }
  choose(index: number) {
    if (
      !this.open ||
      this.phase !== "choose" ||
      !this.armed ||
      !Number.isInteger(index) ||
      index < 0 ||
      index > 2
    )
      return;
    this.selected = index;
    this.armed = false;
    this.motion = 0;
    this.phase = "feedback";
    this.message = this.correct
      ? "Yes. Hacia atrás: back, away from the goal you are attacking."
      : "Try again. Hacia atrás means back, away from the goal you are attacking.";
  }
  next() {
    if (
      !this.open ||
      this.phase !== "feedback" ||
      !this.correct ||
      this.demonstration ||
      this.motion < 1
    )
      return;
    if (this.round === 0) {
      this.round = 1;
      this.begin();
    } else {
      this.phase = "complete";
      this.message =
        "Two arrangements explored. Now say the phrase without the translation.";
    }
  }
  demonstrate() {
    if (!this.open) return;
    this.view = "activity";
    this.phase = "feedback";
    this.armed = false;
    this.demonstration = true;
    this.selected = this.arrangement.answer;
    this.motion = 0;
    this.message = "Watch the ball travel back. Then try it yourself.";
  }
  reset() {
    this.round = 0;
    this.begin();
  }
  frame(delta: number) {
    if (
      this.open &&
      this.selected !== null &&
      Number.isFinite(delta) &&
      delta > 0
    )
      this.motion = Math.min(1, this.motion + Math.min(delta, 0.1) / 0.7);
  }
}
