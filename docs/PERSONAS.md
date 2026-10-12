# Three concrete experience personas

These are fictional design personas, not interviewed participants or evidence of learning effectiveness. They translate the first prototype into observable tests. The names and backgrounds are illustrative.

## Alex, 32 — The fan who wants the match first

Alex watches football every weekend, knows the game well, and knows almost no Spanish. He puts on his Quest while sitting on the sofa after work. He wants a football experience, and will leave if it feels like compulsory homework.

**His 30-second experience:** Alex selects Start match with a hand ray and pinch. He watches the pass at 6–8 seconds and hears the English commentary. During the replay at 12 seconds, he notices the separate card: “El jugador pasa el balón.” He chooses Explore because the moving arrow makes the sentence feel connected to something familiar. The match continues alongside the separate explanation. He selects Trace right hand and follows the route from player 7 to player 9. “El jugador”, “pasa”, and “el balón” become readable in order. He chooses Listen once, saves the phrase, then closes the companion without seeking or changing match playback. He can explicitly pause if he prefers to focus.

**The promise to test:** He can enjoy the entire clip without interacting with a learning card. Choosing to explore must keep the match visible; Alex decides how to split his attention and whether to pause.

**Morning checks:** Ignore the first run entirely. On a second run, explore during the replay, trace, and return. Report whether the card was distracting and whether simultaneous viewing felt comfortable and whether he wanted to pause voluntarily.

**Failure signals:** He feels forced to study; the diagram covers the match; a Spanish voice interrupts without Listen; returning skips footage; tracing needs repeated precise gestures.

**Automated evidence:** ignored/muted/offline completion; replay window boundaries; previous playback intent; continuous trace guards; full browser journey.

## Maya, 46 — The beginner who needs a forgiving interaction

Maya understands football but is new to hand controls in VR. She has limited comfortable reach and prefers a quiet session. She wants to understand the sentence without being assessed on hand accuracy.

**Her 30-second experience:** Maya uses the introduction to understand pointing and pinch selection. She mutes commentary and follows the captions. When the replay card appears, she pauses first, then explores. She tries tracing with her left hand. If tracking is lost, the ball stops and an instruction explains how to continue. If tracing feels awkward, she selects Replay action. The ball travels the complete route and all three phrase chunks stay readable. She saves the phrase without having to trace successfully. Back leaves her match paused because she paused before entering Explore.

**The promise to test:** Replay is a complete alternative to tracing. Audio is optional. A stationary seated viewer can reach and read the essential controls comfortably.

**Morning checks:** Try left-hand tracing, deliberately lower the hand out of tracking, then choose Replay. Return from a previously paused match. Read “balón” and the English meaning at normal seated distance.

**Failure signals:** Resting hands advance the ball; tracking loss awards completion; Replay ends by hiding the sentence; small text requires leaning; controls require reaching outside comfortable space.

**Automated evidence:** no progress before explicit arming; tracking/depth freeze; Replay completion retention; paused return; muted caption-driven viewing; narrow browser layout. Actual seated reach and hand comfort require Quest evidence.

## Ben, 39 — The returning learner who gets interrupted

Ben has a few minutes between commitments. He expects the phrase he saved yesterday to remain available, and wants to stop without losing his place. He is not expecting an account or cloud service.

**His two-session experience:** Ben sees the passing replay, saves the phrase, and opens Your phrases. He requests pronunciation from the library, then returns. When he removes the headset, the app pauses and stops Spanish audio. On returning he must select Resume; it never silently runs ahead. If he closes the browser, the next visit offers Resume previous session. The saved phrase and seen events restore from the same app origin. If he selects Restart instead, the clip and current seen list reset while the saved phrase remains. If browser storage is unavailable, the app explains that the save failed and keeps the button unsaved.

**The promise to test:** “Saved” means the browser accepted the durable write. Resume restores current-session context; Restart preserves saved learning material.

**Morning checks:** Save once, suspend XR, resume, close and reopen the same URL, inspect Your phrases, then Restart. Try one run after the clip has fully loaded with network access disabled.

**Failure signals:** The match runs during interruption; Resume creates a backlog of expired cards; saving duplicates a phrase; a failed write says Saved; reopening another origin is presented as restoring the same profile.

**Automated evidence:** browser reopening; snapshot validation; save deduplication; quota/access failure; suspension/resume; restart preservation; completed loaded-session playback without network.

## How to use these scenarios

Run Alex’s flow first, Maya’s second, then Ben’s interruption/reopening flow. Record actual observations in [QUEST_REVIEW.md](QUEST_REVIEW.md). Give each check Pass, Fail, or Not tested. Persona walkthroughs are hypotheses and acceptance scenarios; they do not establish recall, enjoyment, or accessibility outcomes.

## Team identity and language progression

- **Alex — Barça supporter:** chooses the Barça-inspired football theme and starts with English commentary. He opens a pass explanation alongside the playing match. When comfortable, he switches commentary to Spanish without seeking or pausing. For the separate chant timing demonstration he uses Blue or Amber; actual Barça song material is not included.
- **Maya — Madrid supporter:** chooses the Madrid-inspired theme and keeps English support. She moves the companion left and uses the far/high preset to watch both windows. If she wants to concentrate, she explicitly pauses; Replay works without fingertip tracing.
- **Ben — McLaren supporter:** chooses the sharper McLaren-inspired F1 theme and returns to his saved preferences on another visit. For the browser-window path, he watches the F1 behind-the-scenes video, opens an independent companion, and replays the original overtake concept without pausing the video. His saved moments are scoped to that recording. A long full-race source and reviewed action timing remain later work.

These are fictional scenarios for design and testing, not participant observations or learning-effectiveness evidence. The Barça full match and the F1 behind-the-scenes video are integrated; real-song cues and a full F1 race are not.

For the full-match route, Alex starts the Barça game and puts the companion to one side using Quest’s window controls. Maya uses the same independent window with Replay rather than tracing, choosing to pause only if she wants to concentrate. Ben tries the F1 behind-the-scenes video and returns later to its stored phrase and moments. Check whether the source continues when focus moves between windows; no physical Quest result is claimed yet.
