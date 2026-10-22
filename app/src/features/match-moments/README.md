# Match moments and optional goal celebration

Reviewed: 2026-10-18. The [PRD](../../../../PRD.md) owns requirements; [Quest cases](../../../../docs/QUEST_REVIEW.md#optional-goal-celebration-prototype--18-october-2026) own device acceptance.

## Try the celebration prototype

Enter VR with the configured private Barcelona recording. In the palm/controller menu,
open **More**, switch **Celebrations: Off** to **On**, then select **Try celebration**.
The menu closes for this explicit demo. Start with both hands low, then raise both to
the floating hand outlines and hold briefly. Each outline fills blue when its hand
is in place; the floating text and progress bar confirm the brief hold. Tracked
wrists or controller grips work; sitting or standing uses the same placement rule. The cue is optional and has a Close button.

For normal playback, the prepared `coutinho-goal` card ends at recording **820 seconds**
(13:40). Crossing that time during uninterrupted playback invites a celebration for
10 seconds. It uses the prepared source timeline, not goal detection or the broadcast
clock. Seeking to/past it, resuming later, or replaying it does not announce a goal.
Other recordings, the original `?sample=1` route and unreviewed recognition drafts do
not receive this goal. Enabling the switch after the goal does not announce history.

Targets are placed once per invitation: 29 cm to each side, 50 cm forward and 2 cm
below the viewer's head, using horizontal facing direction. They stay fixed when
the viewer turns or moves. Each wrist/grip must be within a 15 cm target radius;
both must remain in place for 0.35 seconds after a fresh tracked pose outside them.
Already-placed hands must first leave the guides. A missing hand loses its feedback
immediately; raised hands elsewhere do not count. Tracking loss, one missing
hand or manipulating a window resets the hold. A completed gesture starts four
seconds of shoulder lifts, a small hop and head sway, then the companion disappears.
Reduced-motion preference removes the hop and oscillation. Ignoring the invitation
has no penalty. Pause/seek/visibility loss and opting out cancel a normal invitation.
The labelled demo can run with the match paused; it never starts playback itself.

Playback, commentary, selected/flipped cards and saving remain owned by their existing
features. The celebration coordinator only reads the player; it has no pause, seek,
volume or card-selection commands. The companion stays beneath the screen and follows its authored transform. The
hand guides and text have their own world-space anchor, independent of screen
move/resize, and never follow head jitter. The hand outlines disappear on success;
the success text and companion remain for the four-second animation. This is a prototype placement requiring Quest
comfort/legibility checks, not a restored tabletop or a full animation system.

## Source and verification

- `celebration.ts`: opt-in, source crossing, expiry and fresh gesture state.
- `celebration-pose.ts`: actual WebXR wrist/grip and viewer poses, without missing-pose inference.
- `celebration-motion.ts`: rigid shoulder/head animation; regression checks measure actual GLB hand height.
- `celebration-xr.ts`: integration and observable `CelebrationStatus` state.
- [Asset authoring](../../../content-source/kawaii-celebration/README.md): smaller derivative of the original kawaii v3 model.

Automated tests cover timing, opt-in, replay/seek suppression, tracking loss, manipulation,
seated/standing input, explicit demo behaviour and actual model-axis motion. To replay
the controller journey against a **fresh managed app page**, enter the emulated XR
session, then run from `app/`:

```sh
node tests/xr/celebration.mjs
```

It selects real menu controls and moves real emulated controllers; it never writes the
celebration state. It checks one-hand rejection, two-hand completion, expiry and the
advancing match clock. Private inputs/screenshots are saved under the ignored
`content-source/match-analysis/celebration-guides/` directory. The emulator journey
uses the labelled demo; natural goal timing is unit-tested separately. Physical Quest
hand occlusion, gesture comfort, false positives and performance remain unverified.
