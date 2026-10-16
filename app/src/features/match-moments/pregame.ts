import type { Card } from "../match-lab/cards";
export const matchSourceId = "barca-2018-full";
// Recording 03:07 corresponds to match 00:00 in this prepared pack.
export const kickoffSeconds = 187;
const preview =
  "https://www.fcbarcelona.com/en/news/893694/clasico-preview-fc-barcelona-v-real-madrid/amp";
const teams =
  "https://www.skysports.com/football/barcelona-vs-real-madrid/teams/399397";
const notes = [
  [
    "barca-form",
    "Last league game",
    "El Barça ganó cuatro a dos contra el Sevilla.",
    "Barça won four-two against Sevilla.",
    "Ganó means won. This is the previous league match.",
    preview,
    "FC Barcelona · 27 Oct 2018",
  ],
  [
    "madrid-form",
    "Madrid's recent form",
    "El Madrid solo ha ganado uno de sus últimos siete partidos.",
    "Madrid have won only one of their last seven matches.",
    "Últimos siete partidos means last seven matches.",
    preview,
    "FC Barcelona · 27 Oct 2018",
  ],
  [
    "team-news",
    "Team news",
    "Messi no juega porque está lesionado.",
    "Messi is not playing because he is injured.",
    "Está lesionado means is injured. Historical team news for this match.",
    preview,
    "FC Barcelona · 27 Oct 2018",
  ],
  [
    "barca-lineup",
    "Barça lineup highlights",
    "Alba y Suárez están en el once inicial.",
    "Alba and Suárez are in the starting eleven.",
    "El once inicial means the starting eleven.",
    teams,
    "Sky Sports · 28 Oct 2018 lineup",
  ],
  [
    "madrid-lineup",
    "Madrid lineup highlights",
    "Bale y Benzema son titulares.",
    "Bale and Benzema are starters.",
    "Titulares means starting players.",
    teams,
    "Sky Sports · 28 Oct 2018 lineup",
  ],
] as const;
export const pregameCards: Card[] = notes.map(
  ([id, title, spanish, english, hint, url, source]) => ({
    id: `pregame-${id}`,
    title,
    spanish,
    english,
    hint,
    artwork: "pregame",
    artworkCardId: "pregame",
    context: { source, url, asOf: "2018-10-28", kind: "Before kick-off" },
    evidence: {
      sourceId: matchSourceId,
      startSeconds: 0,
      endSeconds: 0,
      commentarySummary:
        "Editorial context from linked historical source; not extracted commentary.",
      visualObservation:
        "Original teaching illustration; not evidence of this news item.",
      frameSeconds: [],
      matchClock: "Before kick-off · 28 Oct 2018",
      commentaryStartSeconds: 0,
      commentaryEndSeconds: 0,
      reviewStatus:
        "Source checked; AI-authored Spanish; fluent Spanish review pending",
    },
  }),
);
