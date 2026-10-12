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
/** Fan-inspired palettes, not official brand assets or team endorsements. */
export const teamThemes: Record<Team, TeamTheme> = {
  neutral: {
    name: "Just watching",
    background: "#101917",
    panel: "#1c2821",
    control: "#304537",
    accent: "#a8d4ad",
    accentInk: "#14281c",
    stripe: "#476a51",
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
    background: "#10152c",
    panel: "#1d2444",
    control: "#303757",
    accent: "#f8d05c",
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
    background: "#211214",
    panel: "#341c20",
    control: "#4c292d",
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
