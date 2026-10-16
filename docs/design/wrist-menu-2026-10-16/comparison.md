# Virtual card and gesture menu comparison

Reviewed: 17 October 2026. Reference: [approved concept](concept-with-listen.png). Runtime evidence: [comparison sheet](../../../app/artifacts/ui-runtime-review.jpg). This is a visual and functional comparison, not a human usability study or Quest acceptance.

| Reference | Implemented correction | Verification boundary |
| --- | --- | --- |
| Small cream pill, three circles | Play/Pause in navy, Moments in blue, More in lavender; small labels beneath; coral unread badge. Removed the permanent instruction line and large tiles. | Runtime layout: menu buttons 56 × 56 units, not the kit's previous 80-unit minimum width. |
| Rounded physical card | Rounded shell, both texture faces and artwork; cream front/back; warm cream bevel, 20 mm total authored depth. No square image plane covering the corners. | Rendered model and runtime; physical reach, scaling and grip comfort need Quest. |
| Image first, one timestamp, prominent phrase | Artwork near the top, one recording-time label, larger bundled Libre Baskerville bold sentence. Atkinson for controls/metadata. Long copy reduces in size to remain above the controls. | Check the longest pregame card and story on Quest. Concept lettering is generated; the font is a consistent licensed approximation. |
| Replay / Listen / Save on the card | Three circular targets with labels beneath, blue Listen, checked bookmark on Save. Both sides support actions. Flip physically or via More. | Controller-emulator inputs and automated action tests; controller squeeze grabbing and a 180° turn exposed the reverse action panel; hands-only flip remains a device check. |
| Quiet New moment invitation | Source-time arrival creates a six-second optional pill with rise, overshoot and lavender glow. Reduced-motion preference removes animation. No automatic full-card opening. | Automated arrival/timing tests and live controller inspection. A card stays pinned through later arrivals. |
| Minimal viewing controls | Deliberate palm-up reveals the menu; palm-away hides it. Controller A/X fallback. More contains placement controls, flip, navigation and Mute/Unmute match. | Palm math/hysteresis tests; actual hand tracking and unintended activations remain unaccepted. |

Replay uses a separate clip. Listening, saving, flipping and opening cards do not control the main match. Match mute leaves pronunciation audio available. Save retains the card and source reference on this device; automatic phone synchronization is still pending. Physical phone and printed-card approaches remain in the roadmap.

## Evidence

- Typecheck, 284 unit tests and production build passed after the typography and mute changes.
- Controller emulation observed the timed invitation, independent replay status, Playing pronunciation feedback, Saved bookmark state, and the Mute → Unmute label change. This does not prove physical hand tracking.
- A browser test initially failed on a 19.947-second capture window versus a 20-second expectation with a 0.05-second tolerance; the targeted rerun passed. The final full browser suite passed: 35 passed, 2 skipped (live voice/service cases).
- The runtime uses Quiet space in the emulator. The living room and physical hands in the concept are illustrative; passthrough appearance and comfort require the Quest 3.

Follow the current [Quest checklist](../../QUEST_REVIEW.md#card-only-match-moments--17-october-2026--quest-acceptance-pending). Prototype Spanish and audio still await fluent review.
