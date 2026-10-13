import type { MatchLab } from "./lab";
export function labPrimaryLabel(lab: MatchLab) {
  if (lab.phase === "observe") return "Try the pass";
  if (lab.phase === "complete") return "Try again";
  if (lab.phase === "feedback" && lab.correct && !lab.demonstration)
    return lab.round === 0 ? "New arrangement" : "Finish";
  return "Try again";
}
export function labStep(lab: MatchLab) {
  return lab.phase === "observe"
    ? "WATCH THE MOMENT"
    : lab.phase === "complete"
      ? "PRACTICE COMPLETE"
      : `ARRANGEMENT ${lab.round + 1} / 2`;
}
export function labFeedbackColor(lab: MatchLab) {
  return lab.phase === "complete" ||
    (lab.phase === "feedback" && lab.correct && !lab.demonstration)
    ? "#175748"
    : lab.phase === "feedback"
      ? "#653a2a"
      : "#432c36";
}
