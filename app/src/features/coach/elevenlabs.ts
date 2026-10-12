import type { CoachConnect } from "./coach";
// Public agent identifier, never an API key. Local demo only; see agent-config.json.
export const coachAgentId = import.meta.env.VITE_COACH_AGENT_ID as
  string | undefined;
export const connectCoach: CoachConnect = async (mode, events) => {
  if (!coachAgentId) throw new Error("Coach is not configured");
  const { Conversation } = await import("@elevenlabs/client");
  return Conversation.startSession({
    agentId: coachAgentId,
    connectionType: "websocket",
    textOnly: mode === "text",
    micMuted: true,
    onMessage: ({ source, message }) => events.message(source, message),
    onModeChange: ({ mode }) => events.speaking(mode === "speaking"),
    onDisconnect: () => events.disconnected(),
    onError: () => events.error(),
  });
};
