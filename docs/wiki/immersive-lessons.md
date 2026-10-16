# Lessons from immersive viewing

Reviewed: 2026-10-16

## A browser window did not deliver the expected experience

**Expected:** watching a match with nearby learning material would feel immersive.

**Observed:** the user reported that browser windows and tabs did not feel like the theater they had imagined. Their references emphasized a large spatial screen, a surrounding environment, and reachable floating controls.

**Learned:** VR needs a spatial activity that benefits from being in the room. ArenaVoca moved toward native video in a theater or passthrough, then Match Lab: explore Alba's cutback, handle replay cards, reveal translations, and practice without interrupting the main match.

**Evidence:** [PRD immersive correction and Match Lab history](../../PRD.md), [demo story](../DEMO_STORY.md). These are recorded product decisions, not evidence that every interaction is comfortable on a headset.

## Video source affects what we can build

The project's YouTube iframe route did not provide the video texture needed for the immersive screen. The locally supplied recording became the primary theater/passthrough source; YouTube remains a separate browser route. Preserve the original `?sample=1` calibration experience. Source handling and media exclusions are described in the [README](../../README.md).

This is a lesson about the integration used here, not permission to redistribute the match. Public submission content has a separate clearance gate in the [roadmap](../SUBMISSION_ROADMAP.md).

## Interaction must protect the viewing experience

The user requested movable/resizable windows and physical cards that can be grabbed and flipped. The [PRD](../../PRD.md) records the implementation and pending checks. The important invariant is still one main match timeline: opening/closing learning panels leaves playback alone, and a selected card stays pinned. Optional learning must not become a forced interruption.

## What has actually been seen on Quest

The user confirmed seeing the real room behind the floating screen on physical Quest 3 on 12 October. That observation establishes passthrough visibility for that run. It does not establish hand interaction quality, sustained performance, all recognition flows, or future glasses support. Browser automation cannot close those gaps.

**Next check:** run the [Quest acceptance checklist](../QUEST_REVIEW.md) for Match Lab in both modes, recording comfort, reach, resize/grab/flip behavior, and whether playback remains uninterrupted. Keep device observations separate from automated results. See [Windows continuation](windows-continuation.md) for the next local-model session.
