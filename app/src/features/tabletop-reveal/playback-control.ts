import type { Session } from "../session/session";
type PlaybackSession = Pick<
  Session,
  "mode" | "matchActive" | "resume" | "togglePlayback" | "start"
>;
/** Returning from the headset must resume the suspended match, never start it over. */
export function activatePlayback(session: PlaybackSession) {
  if (session.mode === "Suspended") return session.resume();
  if (session.matchActive) return session.togglePlayback();
  return session.start();
}
export function playbackLabel(
  session: Pick<Session, "mode" | "matchActive">,
  paused: boolean,
) {
  if (session.mode === "Suspended") return "Resume";
  return !session.matchActive ? "Start match" : paused ? "Resume" : "Pause";
}
