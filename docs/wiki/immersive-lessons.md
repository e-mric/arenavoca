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

## Lessons from the IWSDK live build

Source reviewed 16 October: Devpost's [Go From 0 to a VR Game With the Immersive Web SDK](https://www.youtube.com/watch?v=D04z9PYUSao), recorded 13 October 2026. These notes use its published chapters and selected automatic-transcript passages, checked against official documentation; they are not a report of running its demo ourselves.

| Section | Application to ArenaVoca |
| --- | --- |
| [8:20: Three.js and ECS](https://www.youtube.com/watch?v=D04z9PYUSao&t=500s) | Learn which objects carry state and which systems change it. Keep card placement, translation state, and interaction behavior understandable and inspectable. |
| [12:30: runtime inspection and stepping](https://www.youtube.com/watch?v=D04z9PYUSao&t=750s) | Diagnose failed interactions by examining state before and after input. Pausing or stepping the engine is a debugging technique in an isolated test; it must not become automatic match pausing in the product. |
| [17:10: hand emulation](https://www.youtube.com/watch?v=D04z9PYUSao&t=1030s) | Reproduce grab, movement, release, and flip failures before a headset session, then verify them on physical hardware. |
| [24:00: independent judge](https://www.youtube.com/watch?v=D04z9PYUSao&t=1440s) | Request a separate review against explicit criteria: readable Spanish, reachable cards, visible interaction feedback, and playback independence. Review feedback is a hypothesis to test, not acceptance evidence. |
| [27:10: headset workflow](https://www.youtube.com/watch?v=D04z9PYUSao&t=1630s) | Make physical testing part of each small interaction iteration instead of leaving it until demo rehearsal. |

**Expected:** passing tests and a convincing desktop scene would make the experience ready to try.

**Learned from the reference:** agents can inspect and drive the runtime, and Meta documents connected-Quest testing and device-side performance measurement in IWSDK 1.0. This gives us a workflow to investigate, not proof that it is configured or working in ArenaVoca. [Official announcement](https://developers.meta.com/vr/blog/immersive-web-sdk-1-0/) · [Testing guide](https://iwsdk.dev/guides/02-testing-experience.html)

**Next check:** use one Alba card to exercise grab → move → release → flip → listen → replay, plus window resizing, in theater and passthrough. Record automated input separately from human hand use, along with the build, device/browser versions, failures, and measured performance. The existing visibility confirmation remains the only reported physical acceptance here. Comfortable reach, text clarity, hand reliability, and sustained use still need Emeric's feedback.

The [roadmap testing gate](../SUBMISSION_ROADMAP.md#quest-interaction-testing-gate) defines the next deliverables. For the later real-TV idea, see [camera-access limitations](recognition.md#camera-access-is-a-separate-capability-gate): passthrough visibility is not camera input for a model.
