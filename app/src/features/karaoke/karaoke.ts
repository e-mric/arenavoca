import type { Team } from "../theme/team-theme";
export type { Team } from "../theme/team-theme";
export interface ChantLine {
  team: "blue" | "amber";
  start: number;
  end: number;
  words: string[];
  translation: string;
}
/** Original text-only timing demonstration, not detected or transcribed crowd audio.
 * These draft lines and translations await fluent Spanish review.
 */
export const demoChants: readonly ChantLine[] = [
  {
    team: "blue",
    start: 21,
    end: 24,
    words: ["Vamos,", "equipo", "azul."],
    translation: "Come on, Blue team.",
  },
  {
    team: "blue",
    start: 24,
    end: 27,
    words: ["Juntos", "hasta", "el", "final."],
    translation: "Together until the end.",
  },
  {
    team: "amber",
    start: 21,
    end: 24,
    words: ["Vamos,", "equipo", "ámbar."],
    translation: "Come on, Amber team.",
  },
  {
    team: "amber",
    start: 24,
    end: 27,
    words: ["Juntos", "hasta", "el", "final."],
    translation: "Together until the end.",
  },
];
export function chantAt(
  position: number,
  team: Team,
  enabled: boolean,
  contentVersion: string,
) {
  if (!enabled || team === "neutral" || contentVersion !== "prototype-pass-v1")
    return undefined;
  return demoChants.find(
    (line) =>
      line.team === team && position >= line.start && position < line.end,
  );
}
export function activeWord(line: ChantLine, position: number) {
  if (position < line.start || position >= line.end) return -1;
  return Math.min(
    line.words.length - 1,
    Math.floor(
      ((position - line.start) / (line.end - line.start)) * line.words.length,
    ),
  );
}
