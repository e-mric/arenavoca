# Football Spanish Companion

Read PRD.md before changing product behavior. Application code lives in app/.

- Organize product code by feature under app/src/features/. Keep tests alongside each feature; every new or changed behavior needs a meaningful automated test or a documented Quest-only verification case.
- Follow the generated app/AGENTS.md and its scoped IWSDK instructions for the XR runtime, scene, and spatial UI.
- Keep one match playback authority: the video position drives prompts and captions. Preserve previous play/pause intent when returning from exploration.
- Preserve the first Quest milestone pause. Do not expand to the full six-minute match before actual Quest 3 evidence and user feedback.
- The product vision covers multiple sports, including F1; football remains the first implemented pack. Keep shared learning behavior separate from sport-specific action vocabulary and illustrations when adding a second pack.
- Do not mark device acceptance complete using browser emulation. Identify prototype audio as awaiting fluent Spanish review.
- Run typecheck, unit tests, production build, and affected browser tests before finishing changes.
- Keep assets original and source-controlled. Do not include generated frame sequences, secrets, node_modules, or dist.
