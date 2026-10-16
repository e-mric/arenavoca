> Historical experiment: tabletop play is deferred. Active XR now lives in `../match-moments/xr.ts`; its current requirements are in the PRD.

# Minimal Match Lab

All XR routes now use `attachMinimalXR`. The original `?sample=1` keeps its 30-second recording and browser learning journey, with minimal XR playback and no unrelated Alba cards. Retired panels, theater, stadium and celebration are absent from the active scene and asset catalogue, rather than hidden only at runtime. IWSDK core, CLI, reference and dev plugin were checked against the npm registry on 16 October 2026: 1.0.1 was the latest published version and already pinned.

## Behavior

- One 4.4 × 2.475m curved screen; sparse cream quiet space or transparent passthrough. Screen/dock/board/cards retain move/resize controls. Selected football kits remain on the two original toy figures.
- `HandSurfaceReader` observes native hand joints and optional horizontal planes. Both hands must be near the plane; the board corners must fit its outline. It does not sense pressure or prove physical contact. A complicated concave boundary can still require manual adjustment.
- `TabletopReveal` requires a stable 0.8s hold, places once, and keeps the placement after hands lift. Explicit close requires observed hands above the former surface before rearming. Missing tracking cannot rearm it.
- **Adjust → Use hand height** explicitly enables calibration without surface data. **Place manually** positions a reachable board and permits adjustment. Neither fallback claims automatic table recognition.
- Practice controls (Flip and Next/Reset) live in the dock so the physical card face stays dedicated to its instruction and feedback. Practice reuses deterministic pass/shot rules and assisted pull/release, grabbable players and physical cards. **Cards** switches to source-linked replay, translation, listening, save, story and navigation. Learning owns no match playback authority.
- Finger kicking, automatic new-moment invitations, saved-card tray, recall UI and the F1 tabletop remain proposed. Prepared content is not fresh model recognition. Prototype Spanish/audio await fluent review.

## Verification · 16 October 2026

Typecheck, 250 unit tests and production build pass. The 23 affected browser checks cover original sample journeys, full recording/F1 source behavior, cards/stories/replay and playing/paused playback preservation. Managed IWSDK XR controls verify manual placement, practice/card switching, flipping, closing/reopening, the backward pass and the dock Next-to-shot flow the immersive-AR launch and the enabled optional hand/plane feature requests. Scene validation and bounded visual review completed. No physical Quest acceptance is claimed.

`reveal.test.ts` exercises hold timing, stability, close/rearm, calibration and tracking-loss semantics. `hand-surface.test.ts` exercises native-observation fixtures, plane fit and unavailable surfaces. Device-only acceptance cases live in [Quest review](../../../../docs/QUEST_REVIEW.md#minimal-reset-with-table-reveal--16-october-2026); the [PRD](../../../../PRD.md#active-xr-design-reset--16-october-2026) is the product authority.

## Legacy scene cleanup · 16 October 2026

Removed the old dashboards and decorative scenery from the scene and editor manifest. Restored the dock content and practice-card front to their parent objects after finding detached authored offsets. Scene contract tests prevent retired panels/assets returning and verify the retained manipulation targets, two players and attached card text. Typecheck, 266 unit tests and production build pass. The full browser suite passed 35 checks with two live-service checks skipped; all 25 affected browser checks passed again after the final placement correction. Managed Quest 3 emulation verified Start → manual placement → Cards → Close, with independent match playback and no retired panels. The scene render validates without diagnostics. [Runtime view](../../../artifacts/minimal-xr-cleanup.jpg). Physical Quest acceptance remains pending.
