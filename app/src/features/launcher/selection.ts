import type { Content } from "../content/model";
import {
  footballKits,
  themeFor,
  type Sport,
  type Team,
} from "../theme/team-theme";
import { streamLessons } from "../sports/practice";

export function selectionDetails(content: Content, sport: Sport, team: Team) {
  const theme = themeFor(team, sport);
  const recordingSport = content.sport ?? "football";
  const matchesRecording = sport === recordingSport;
  const kit = footballKits[team];
  return {
    title: `${theme.name} · ${sport === "football" ? "Football" : "F1"}`,
    shirt: sport === "football" ? kit.shirt : theme.stripe,
    trim: sport === "football" ? kit.trim : theme.background,
    spanish: streamLessons[sport].spanish,
    english: streamLessons[sport].english,
    effect:
      sport === "football"
        ? "Your selected team colours appear in this preview."
        : "F1 colour preview. Timed racing cards are not available yet.",
    source: matchesRecording
      ? `Ready to watch: ${content.title ?? "Original 30-second football clip"}. Team choice changes the colours, not the recording.`
      : "The football clip stays loaded. This is a vocabulary and colour preview; F1 match moments are coming later.",
    chantAvailable:
      sport === "football" &&
      (team === "blue" || team === "amber") &&
      content.version === "prototype-pass-v1",
  };
}
