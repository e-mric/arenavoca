# ArenaVoca

Read PRD.md before changing product behavior. Application code lives in app/.

- Organize product code by feature under app/src/features/. Keep tests alongside each feature; every new or changed behavior needs a meaningful automated test or a documented Quest-only verification case.
- Follow the generated app/AGENTS.md and its scoped IWSDK instructions for the XR runtime, scene, and spatial UI.
- Keep one match playback authority: the video position drives prompts and captions. Opening or closing Explore or the phrase library must not pause, seek, dim, or resume the match. Pause is an explicit playback choice; the selected learning item stays pinned while playback advances.
- Preserve the original sample at `?sample=1`. The user subsequently requested native full-match viewing in an immersive theater and passthrough, using their locally supplied recording. Treat that as the primary prototype, while keeping the YouTube browser-window route secondary and its evidence separate.
- The product vision covers multiple sports, including F1; football remains the first implemented pack. Keep shared learning behavior separate from sport-specific action vocabulary and illustrations when adding a second pack.
- Do not mark device acceptance complete using browser emulation. Identify prototype audio as awaiting fluent Spanish review.
- Run typecheck, unit tests, production build, and affected browser tests before finishing changes.
- Keep assets original and source-controlled. Do not include generated frame sequences, secrets, node_modules, or dist.
