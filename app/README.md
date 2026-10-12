# ArenaVoca app

See [the project README](../README.md) for setup, feature structure, automated checks, and the morning Quest 3 review. The project requirements are in [PRD.md](../PRD.md).

## Optional AI coach

On `/`, start a match and choose **AI coach** in the desktop toolbar or floating playback controls. Choose **Start voice**, then **Speak a question** (tap Done or let the 15-second window end). Explain, Say it slowly, Let me try and Simple Spanish send an invited request. Start text works without microphone permission. End session releases the conversation; Close returns to the previous learning panel. The match keeps its current playback state.

The real ElevenLabs SDK is loaded only on explicit start. Copy `.env.example` to `.env.local` and set your public `VITE_COACH_AGENT_ID`; never put an API key in a Vite environment variable. This Mac already has its demo ID configured locally. The versioned `src/features/coach/agent-config.json` records the prompt and verified provider settings. The local demo has a public agent with 30 calls/day and two concurrent calls, no stored audio, one-day transcript retention, a five-minute cap and a 60-second silence limit. Public agent IDs are visible to browser clients and are not credentials. Add server authentication before external deployment; the dashboard currently rejects the local hostname allowlist entries.

Only authored phrase context is sent. No video capture or match audio stream is attached. A microphone can still pick up nearby match sound; headphones are recommended. The AI cannot answer what the commentator just said. Pronunciation and pedagogical quality require fluent Spanish review.

Automated checks: `npm run typecheck`, `npm test`, `npm run build`, and `npx playwright test coach.spec.ts theater.spec.ts`. To exercise the live provider deliberately: `ARENAVOCA_LIVE_COACH=1 npx playwright test coach.spec.ts -g "live coach"`. The other coach tests mock the network boundary while exercising the actual SDK. For an offline test checkout without an agent, build with `VITE_COACH_AGENT_ID=mock-coach npm run build` before running the mocked tests (the dummy identifier is intercepted by Playwright). Rebuild with your real local configuration afterward for the demo.

Future work and headset acceptance: [AI Coach Roadmap](../PRD.md#ai-coach-roadmap--12-october-2026).
