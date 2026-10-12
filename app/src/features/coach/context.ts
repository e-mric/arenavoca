export interface CoachContext {
  sport: string;
  team: string;
  phrase: string;
  translation: string;
}

/** Only authored learning context is shared; the coach never receives match audio. */
export function coachContextMessage(context: CoachContext): string {
  return JSON.stringify({
    sport: context.sport,
    team: context.team,
    phrase: context.phrase,
    translation: context.translation,
    nativeLanguage: "English",
    learningLanguage: "Spanish",
    liveCommentaryAvailable: false,
    instruction:
      "This is a manual practice concept, not a detected live event.",
  });
}
