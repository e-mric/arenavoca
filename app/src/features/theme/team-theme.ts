export type Sport = "football" | "f1";
export type Team =
  "neutral" | "blue" | "amber" | "barcelona" | "madrid" | "ferrari" | "mclaren";
export interface TeamTheme {
  name: string;
  sport?: Sport;
  background: string;
  panel: string;
  control: string;
  accent: string;
  accentInk: string;
  stripe: string;
}
/** Matchday surfaces with fan-inspired accents; no official team assets or endorsements. */
export const teamThemes: Record<Team, TeamTheme> = {
  neutral: {
    name: "Just watching",
    background: "#160e16",
    panel: "#281922",
    control: "#432c36",
    accent: "#ffb59e",
    accentInk: "#31151b",
    stripe: "#963a50",
  },
  blue: {
    name: "Blue demo team",
    sport: "football",
    background: "#111a28",
    panel: "#1d2b40",
    control: "#293b54",
    accent: "#8cb9f3",
    accentInk: "#112235",
    stripe: "#447bbe",
  },
  amber: {
    name: "Amber demo team",
    sport: "football",
    background: "#201911",
    panel: "#30261b",
    control: "#453728",
    accent: "#edc079",
    accentInk: "#281c0d",
    stripe: "#a6732b",
  },
  barcelona: {
    name: "FC Barcelona",
    sport: "football",
    background: "#100f1d",
    panel: "#271a2c",
    control: "#292d49",
    accent: "#ffd18a",
    accentInk: "#1c1b29",
    stripe: "#bc244a",
  },
  madrid: {
    name: "Real Madrid",
    sport: "football",
    background: "#11131c",
    panel: "#242733",
    control: "#393d4a",
    accent: "#f1f2f8",
    accentInk: "#171923",
    stripe: "#d9bf79",
  },
  ferrari: {
    name: "Ferrari",
    sport: "f1",
    background: "#180c12",
    panel: "#2c1620",
    control: "#482331",
    accent: "#ff777c",
    accentInk: "#2b1014",
    stripe: "#cc2233",
  },
  mclaren: {
    name: "McLaren",
    sport: "f1",
    background: "#1b1712",
    panel: "#2d251d",
    control: "#453627",
    accent: "#ff9c33",
    accentInk: "#28180a",
    stripe: "#ff8000",
  },
};
export function themeFor(team: Team, sport: Sport) {
  const theme = teamThemes[team];
  return !theme.sport || theme.sport === sport ? theme : teamThemes.neutral;
}
export function teamsFor(sport: Sport) {
  return (Object.keys(teamThemes) as Team[]).filter(
    (team) => teamThemes[team].sport === sport,
  );
}

/** Fan-inspired practice kits shared by both teammates; no official badges. */
export const footballKits: Record<Team, { shirt: string; trim: string }> = {
  neutral: { shirt: "#1646ed", trim: "#142352" },
  blue: { shirt: "#447bbe", trim: "#112235" },
  amber: { shirt: "#edc079", trim: "#281c0d" },
  barcelona: { shirt: "#1746a2", trim: "#bc244a" },
  madrid: { shirt: "#f1f2f8", trim: "#d9bf79" },
  ferrari: { shirt: "#1646ed", trim: "#142352" },
  mclaren: { shirt: "#1646ed", trim: "#142352" },
};
