# Architecture and boundaries

Reviewed: 2026-10-17

## Decisions and reasons

| Decision | Reason and practical boundary |
| --- | --- |
| IWSDK/WebXR for the immersive experience | Keep the current theater and passthrough prototype on its existing web runtime. A Meta Spatial SDK migration is not the selected plan. Other headset compatibility needs separate verification. |
| KMP companion for Android and iOS | Share recap rules and data while keeping Android Compose and iOS SwiftUI presentation. KMP is not the renderer for the current VR scene. |
| Feature-based product code | Keep behavior and its tests together under `app/src/features/`; expose clear contracts between playback, learning, recognition, and presentation. |
| One main playback authority | Video time drives learning context. Opening panels or reading cards must not take control of the match. Pause remains explicit. |
| Separate model providers from learning content | Cloud and local adapters produce a common evidence-bearing draft. Review and validation happen before the result becomes learning material. |
| Shared learning, sport-specific content | Football is the first recognition case. F1 vocabulary and practice can reuse learning behavior without claiming a full-race recognition pipeline. |

These decisions are recorded in the [PRD](../../PRD.md) and [repository overview](../../README.md). Read [root instructions](../../AGENTS.md) and [application instructions](../../app/AGENTS.md) before changing the relevant code. Dependency versions belong in package manifests and lockfiles, not in this summary.

## The flow to understand

Recorded video → bounded evidence window → chosen recognition provider → validated draft → reviewed moment/card/story → spatial interaction or mobile practice.

The analysis path observes playback; it does not drive it. A selected learning item remains pinned as the main match advances. The user's decision to replay a moment is distinct from seeking the main match. See [immersive lessons](immersive-lessons.md) and [recognition](recognition.md).

Mobile progress currently stays on its device. Saved phrases can travel through an explicit recap export/import; this is not account synchronization. Setup and current behavior live in the [README](../../README.md).

## Open questions

- What evidence is needed before supporting another headset beyond Quest 3?
- Which data should eventually sync between viewing and mobile practice?
- Can recognition remain timely enough for live viewing on the target PC? This needs measurement, not an architecture assumption.

## Feature ownership

Inspect these current entry points before changing a boundary:

| Responsibility | Owner |
| --- | --- |
| Media timeline and explicit commands | `app/src/features/playback/`, `app/src/features/session/` |
| Prepared moment delivery, pregame content, card actions and palm menu | `app/src/features/match-moments/` |
| Independent window movement, grips and resizing | `app/src/features/spatial-windows/` |
| Headset session and viewing-space behavior | `app/src/features/xr/`; runtime composition in `app/src/index.ts` |
| Evidence/provider drafts and review | `app/src/features/match-recognition/`; feature README owns setup/tests |
| Content, audio and persistence contracts | `content/`, `audio/`, `progress/`, `recap/` under features |
| Native recap/stories and platform UI | Feature-owned `native/` directories; build wiring in `app/native/` |

The current card flow still integrates selected `match-lab` services; the folder name does not make deferred tabletop UI active. Keep legacy compatibility isolated and change boundaries incrementally. Meaningful domain/application/adapter/presentation layers belong inside features when needed, not as empty mandatory folders. See [verification workflow](../AI_COLLABORATION.md#verification).
