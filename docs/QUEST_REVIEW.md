# Morning Quest 3 prototype review

The primary review is now the immersive full-match prototype, not the earlier browser-window flow. Use hands and stay seated. Keep the Mac awake and the server running.

1. Open **http://localhost:4173/** in Quest Browser through the USB route below.
2. Choose **Theater**: expect a dark lounge, a large Barça match screen and floating controls. Point and pinch **Start**.
3. Open **Explore**, use Replay, Listen and Save. The full match must continue; only explicit Pause should stop it. Try left/right, near/far and low/high placement presets and Recenter.
4. Exit the immersive session, then choose **My room · Passthrough** from the page header. Expect your real surroundings, with the lounge walls/floor/seats removed and the same video and panels floating in space. Resume explicitly after leaving a session. Confirm the background is genuinely camera passthrough, not black.
5. Check text readability, hand-ray selection, tracking loss, comfort and sustained frame rate. Passthrough currently has no room scanning, surface placement or real-object occlusion; panels use deliberate world-space presets.

The upcoming Meta VR glasses are the intended product target; Quest 3 is the available test device. Optional gaze tracking is enabled with headset-ray fallback. The installed IWSDK 1.0.1 configuration does not support the glasses field-of-view mask, so glasses field-of-view and hardware acceptance are still unverified.

Physical Quest 3 passthrough checkpoint passed by user report on 12 October 2026: after My room entry, the real room and floating screen are visible. This confirms camera passthrough and screen presentation; it does not establish sustained video playback, hands-only controls, comfort or performance.

The earlier physical Quest result proved only that the Barça browser page was visible. Emulator evidence now proves VR/AR entry and controller-ray Start/Explore/Replay, with the theater removed in AR; it does not prove hands-only acceptance. Physical passthrough visibility is now separately user-confirmed. The Mac screenshot fallback returned black on the Quest, so visual headset results must be reported by the wearer.

## Choose a test route

### USB production build (no emulator)

Use this route if your Quest has developer mode and can authorize USB debugging.

```sh
cd /Users/emericvanfrausum/workspace/mecha/app
npm run build
npm run preview
```

In a second terminal, connect the Quest by USB, accept the debugging prompt in the headset, then:

```sh
npx metavr device list
npx metavr adb reverse tcp:4173 tcp:4173
```

Open **http://localhost:4173/** in Quest Browser. Loopback is treated as a secure browser origin, so this route avoids a local certificate. Keep the cable connected. With multiple devices, pass the desired serial through metavr's `-d` option. Both Theater and My room request hand tracking. If VR entry is unavailable, record the browser message rather than treating desktop rendering as a device pass.

### Wi-Fi HTTPS development server

```sh
cd /Users/emericvanfrausum/workspace/mecha/app
npm run dev
npm run dev:status
```

Put the Quest and Mac on the same Wi-Fi network. Open one of the **HTTPS network URLs printed by dev:status** in Quest Browser. The SDK uses a self-signed development certificate; the browser may show a one-time warning that you must handle yourself. `npm run dev:http` is a desktop-emulation helper, and its LAN HTTP URL is unsuitable for headset VR. The SDK's emulator activates on desktop rather than on the physical headset.

A published stable HTTPS origin is still a later hosting decision. Device-local progress belongs to an origin: `localhost:4173` and the Wi-Fi URL have different progress stores. Pick one route when checking reopening.

## Secondary YouTube browser-window review

Open **http://localhost:4173/watch.html?source=barca** through the USB route above, or `/watch.html?source=barca` on the HTTPS network origin. This page uses Quest Browser windows; **do not select Enter VR** for this path.

1. Start the Barça player using its own Play control. It should report 99:21. Choose Barça or Madrid colours.
2. Select **Open companion window** and arrange it with Quest’s window controls. Confirm the match continues when you focus the companion.
3. Try Listen, Replay action, Start trace, Save phrase and Save this game moment. They must leave the match running. The practice diagram is an original concept, not a reconstruction or detection of the current footage.
4. Deliberately pause using the companion. Learning must remain usable while the game stays paused. Return the companion to the game window; playback must not resume or jump.
5. Select the F1 Behind the Charge source, choose Ferrari or McLaren colours, and repeat. This verified embeddable behind-the-scenes video is **8:05**, not a full race; the supplied Miami replay blocks embedding. Confirm the overtake illustration and phrase replace the football practice.
6. Reopen the same origin and source. Team preference, saved phrase and bookmarked positions should persist. Bookmark jumps are explicit and made from the game window.
7. Inspect YouTube’s audio settings. This prototype cannot add an alternate commentary track to the publisher’s recording. Use the original immersive sample below to review the implemented English/Spanish switch.

| Browser-window check | Pass / Fail / Not tested | What happened |
| --- | --- | --- |
| Barça embedded playback / source duration | Not tested | Page visibility confirmed by user on physical Quest 3 over USB, 12 October 2026. Playback and duration not yet confirmed. |
| Detached companion remains alongside playing game | Not tested | |
| Quest window movement, readable text and hand selection | Not tested | |
| Replay / trace / Listen never pause or seek the game | Not tested | |
| Explicit pause remains paused after returning companion | Not tested | |
| F1 behind-the-scenes video playback and sport-specific practice | Not tested | |
| Theme, phrase and moment persistence | Not tested | |

## About five minutes of hands-only checks

1. Open **http://localhost:4173/?sample=1**, select **Enter theater**, then **Start** using hand pointing and pinch. The original simulation should play with English commentary. Watch one complete run without using the learning card.
2. Restart. At **12 seconds**, the pass card appears beside the match, through 20 seconds. Check that it does not overlap the video and that “balón” displays its accent.
3. Select **Explore action**. The match and commentary must keep playing, at normal brightness. The separate explanation stays pinned after 20 seconds. Choose **Trace right hand** or **Trace left hand**, then move that index fingertip to the start of the pass route and follow the ball. The sentence unfolds in three chunks. Resting hands should not start tracing.
4. Lower the tracing hand out of tracking. Progress should freeze. Bring it back, or select **Replay action**. Replay must finish with the complete sentence still visible.
5. Select **Listen**, then **Save phrase**. Spanish must only play on request. Repeated Listen restarts one voice. Close companion stops pronunciation without seeking or pausing the match. It must remain usable if the 30-second clip ends while you are exploring.
6. Repeat Explore after you deliberately **Pause** the match. **Close companion** must leave it paused. Try Panel left/right, nearer/farther, and higher/lower while exploring. Check for overlap, readable text, and comfortable reach; use Replay if the diagram is out of fingertip reach. Check Recenter from the welcome/suspended screen.
7. Remove the headset or exit VR, then return. The app must offer **Resume match** or **Restart**. Close and reopen the same URL, then check **Resume previous** and **Your phrases**. Restart keeps the saved phrase.
8. After loading, disable the network and finish the clip. Confirm video, already loaded pronunciation, captions, and saving still work. Reopening offline is outside this checkpoint.

9. Before starting another run, select Blue or Amber and enable chant lyrics. At 21–27 seconds, only that team’s original draft text should appear, with a word highlight and English meaning below. Hide lyrics leaves playback running. “Just watching” shows no team chant. This is a text-timing demo; there is no supporter audio yet. Check the new lyric panel for clipping or overlap in the headset.

10. Try a football club theme and an F1 team theme before starting. Colours and panel shape should follow your choice; the sample footage remains football. Confirm the theme and text stay readable.
11. During the spoken pass at 6–9.85 seconds, switch English → Spanish → English. The match must not jump or pause, only one commentary track should be audible, and captions should follow the selected language. Check Mute and Listen while Spanish is selected. Spanish speech needs fluent review.

The first pass is a rough original animation with provisional AI speech. Please prioritize whether the interaction works and feels comfortable over decorative polish.

## Record actual results

Date/time: ______ · Route/origin: ______ · Quest Browser version: ______

| Check | Pass / Fail / Not tested | What happened |
| --- | --- | --- |
| Enter VR and Start with hands | Not tested | |
| Video and English commentary | Not tested | |
| Phrase/diagram match the pass | Not tested | |
| Accent and normal-distance readability | Not tested | |
| Controls comfortable while seated | Not tested | |
| Trace right / left hand | Not tested | |
| Tracking loss freezes progress | Not tested | |
| Replay reveals and retains all chunks | Not tested | |
| Listen only on request; no overlap | Not tested | |
| Explore runs alongside the match; closing never seeks/resumes | Not tested | |
| Team theme / commentary switching / alternate audio sync | Not tested | |
| Optional team-filtered lyric panel readability | Not tested | |
| Saved phrase survives browser reopening | Not tested | |
| Suspension requires deliberate Resume | Not tested | |
| Loaded-session playback without network | Not tested | |

Most uncomfortable control: ______
Was the learning card distracting? ______
Did tracing help connect the sentence to the action? ______

Frame rate, ten-minute comfort, three-person text readability, full six-target content, and release language review remain later acceptance work. No headset measurements have been claimed.

## AI coach acceptance (pending physical Quest confirmation)

Reload the production page on Quest after the build. Start the full match, then choose **AI coach** in the floating playback controls. The coach opens beside the screen in both Theater and My room; its placement controls use the existing side/distance/height preferences.

1. Before Start voice, verify no microphone prompt or coach speech. Read the short speech-processing notice. Start voice and grant microphone permission when ready.
2. Select Explain. Hear a short English explanation with Spanish examples. The game continues; commentary lowers during the answer and recovers afterward.
3. Select Say it slowly. Check Spanish intelligibility with a fluent reviewer. Select Let me try, then Speak a question and answer. Verify the Listening label, Done control and automatic mute after your turn (15-second maximum). Use headphones to reduce match sound in the mic.
4. Select Simple Spanish. Replies should become short, simple Spanish. Check full reply pagination when necessary.
5. End session: speech stops and the browser's microphone indicator clears. Close coach: the prior learning panel returns, without seeking or resuming an explicitly paused match.
6. Try Start text after End, then Explain: response without a microphone prompt. Test connection failure and recovery. Remove the headset or open the system menu during speech; verify the session ends.
7. Repeat in passthrough. Record device/browser version, perception of latency, pinch accuracy, speech recognition, echo, readability and comfort. Browser emulation does not establish these results.

Provider settings verified: no stored call audio; one-day transcript retention; 60-second silence cutoff; five-minute session cap; 30 calls/day and two concurrent calls. No application transcript history is persisted. The local demo agent is public and its ID is kept in ignored local configuration; authenticated server credentials are required before public deployment.

## Continue on mobile (pending physical-device review)

1. In the immersive match, save the phrase, then deliberately leave XR. The existing suspension behavior may pause playback at this point. In the browser, resume only if desired, open **Your phrases** and choose **Export saved phrases**. Verify a recap file downloads and exporting does not change the current play/pause state.
2. Move `arenavoca-recap.json` to an iPhone or Android phone using your preferred file-transfer method. The recording is not needed on the phone.
3. Open the native ArenaVoca companion, choose **Import saved phrases**, and select the file. Check the correct match title, sport and saved phrase. A calibration export must stay labelled as an example.
4. Start the recap. A current full-match export has one question, not three invented saved phrases. Answer, inspect feedback and finish. Try an incorrect answer and use **Practise missed phrases**.
5. Relaunch the mobile app and re-import the same file. Check that the session is not duplicated and saved phrases remain. Import the other sport separately; vocabulary must not leak across sessions.
6. Cancel the picker, then try an invalid or oversized file. Existing progress must remain intact and errors must offer a retry. Check large text and narrow portrait layouts on both mobile platforms.

This review has not been performed on physical phones or Quest. Automated Android import tests replace only the system file picker's selection, and the shared rules are tested on JVM and iOS simulator; neither proves cross-device transfer. No account sync or direct headset-to-phone pairing is claimed.


## Playmaker / Matchday design acceptance — pending physical review

- In Theater, confirm Matchday's warm text and team accent controls stay readable against the dark panels. Open Explore and save a phrase while watching; the match should continue. Panel positions are deliberately unchanged.
- In My room, check the same contrast against a bright real room. Switching between theater and passthrough must still remove/restore the enclosure correctly.
- Small learning experiment: compare a near and far placement preset while looking between the action and the phrase. Notice that the panel stays in the world as your head turns. Report which placement feels comfortable; no result is recorded yet.
- On a phone, review Playmaker home, collection and picture quiz in football and F1, including large accessibility text. Select an answer, change the selection, then Check answer. Only confirmation should score. Try Show text answers and a screen reader, then retry a mistake.
- Confirm the diagrams clearly distinguish pass/shot/save and overtake/brake/pit entry. If an action is ambiguous, use the text option and flag the illustration for revision. The diagram quiz has not been validated as a learning assessment.
- Spanish and prototype pronunciation audio still await fluent review.

## Continuous arena welcome animation (pending device review)

Refresh the prototype to begin at the welcome screen, then enter Theater before selecting Start match. Over four seconds, the logo should reveal a stepped arena with the coral play symbol above its floor. It should settle, remain above the welcome controls, and disappear as soon as Start match is selected. Repeat in My room to check the real-room background remains visible. No logo sound or camera movement should occur.

Learning experiment: lean slightly left and right while looking at the settled arena. Its seating tiers should show depth while the logo stays anchored in the scene. Compare that with a flat image. Report whether it reads as an arena and whether the height is comfortable from your seat. This observation has not yet been collected.

With the browser/device reduced-motion preference enabled, the final shape should appear immediately without tilting or unfolding. This preference path is automated-test verified; device propagation still needs checking. Returning to an already-started match must not display the welcome animation over playback.


## Match Lab: Alba’s cutback and moment cards

Pending physical Quest 3 acceptance. Desktop controller emulation is not device acceptance.

1. Reload the local ArenaVoca page with the private Barcelona recording configured. Enter Theater, then Start/Resume. Select **Match Lab / Alba** below the match controls.
2. The cutback card starts in Spanish. Point and pinch the illustration (or **Flip card**) to show English; flip back. **Next/Previous** visits seven moments: the original three Madrid cards and four corrected AI-generated Alba-sequence cards (run, cutback, shot, goal). The floating card keeps its physical orientation when you change content. **Read story** connects the current moment to one of two three-part stories. Confirm the main match advances while the selected card stays pinned.
3. **Watch moment** plays the actual selected excerpt silently. **Hear phrase** reads the displayed Spanish card or story scene. From the shot card, **Read story** selects the third scene (the finish); story navigation skips the separate shot card and follows the three-part story. Confirm the cutback replay shows the pass, and the shot and goal replays start before the finish. Switching cards or closing must stop the excerpt. Missing media must give a recovery message, with the board still available.
4. Choose **Practise cutback**. Select the white ball, then a blue teammate. Round 1 attacks right; send the ball back to A. Try a wrong teammate first and check that the explanation helps. **Show movement** demonstrates without completing the answer.
5. After the successful pass, choose **New arrangement**. The attack now goes left. Select the ball and send it to B, then **Finish**. Check readability of Spanish, arrows, letters and feedback; no translation should be revealed before an answer in either fresh round.
6. Try **Near/far**, **Other side**, and **Higher/lower** while seated. Confirm the full board and controls are readable and the match is unobscured. The lab stays in the room when you turn your head. It is not a physical-surface anchor and does not require room scanning.
7. **Save phrase**, close, reopen and confirm saved state. Saves belong to this browser’s Match Lab; no mobile synchronization or existing phrase-library export is implied.
8. Pause the main match explicitly, then repeat opening, flipping, replay, closing and reopening. It must remain paused at that position. Background/exit during an excerpt; returning must never restart that excerpt by itself.
9. Exit immersive mode and repeat steps 1–8 in **My room · Passthrough**. Confirm the real room stays visible behind the same cards and board. Stop if placement, tracking or two simultaneous videos are uncomfortable.

Record: hand vs controller input, theater vs passthrough, chosen placement, readability, missed selections, video smoothness, and whether you can explain `hacia atrás` in the changed arrangement without English. Spanish and synthetic speech still need fluent review. The main footage and seven silent derivatives are private local demo assets; run `python3 src/features/match-lab/prepare-media.py` from `app/` on the authoring Mac to regenerate them and the provisional speech.


## Hands-on windows and physical cards · 14 October 2026

Reload the app, then test in both **Theater** and **My room**. Device acceptance is pending.

1. Point at a **blue handle**, pinch and hold, move your hand, then release. Try the match screen, playback controls, welcome, learning/phrase library, Explore, chants, coach and Match Lab when each is visible. Their buttons must still work after moving.
2. Pull a **gold corner** outward/inward to resize. Text, diagrams and video should stay proportional; size is bounded. Each window moves independently.
3. Bring a window within reach. Pinch its **peach grip** to move and rotate it. Pinch the same grip with both hands and spread/bring them together to resize. Controllers use squeeze for near grabs and trigger for blue/gold handles.
4. Open **Match Lab**. Its selected moment now has a physical card on your left. Pinch anywhere on the card to hold it, move it, turn your wrist to read English on the back, and turn back to practise Spanish. Use two hands to resize. Release it: it should stay where you put it.
5. After releasing a card, move your hand clear before pointing at a distant button; near-object interaction takes priority. **Flip card** remains a button fallback. Next/Previous and Read story update the same physical card; try them while holding it and while its English side faces you. Its position and wrist orientation must remain yours. **Watch moment** plays on its Spanish face; turn it towards you to see the replay.
6. Move and resize Match Lab, then complete both cutback arrangements. The board and markers must follow the panel, and selection targets must stay aligned. Move/resize Explore and check fingertip tracing too.
7. Use **Reset layout** in playback controls. It restores default placement, orientation and sizes, including the smaller card; it must not change match time, pause intent or saved phrases. Placements survive close/reopen during this page session; reloading restores defaults.
8. Repeat while explicitly paused, then during playback. Background and return, switch input hands/controllers, and temporarily lose hand tracking. No stuck grab, unintended playback, unintentional answer or persistent invisible target should remain.

Check seated reach, text size, near/far pointer transitions, two-hand comfort and Quest frame rate. The screenshot/emulator evidence does not establish these. Speech still awaits fluent Spanish review.

## Tabletop pass and shot · 16 October 2026 · device acceptance pending

Open the full local match, enter **Theater**, then **Match Lab → Tabletop: pass + shoot**. The pitch starts in front of you at about table height; the instruction card sits to its left. Repeat the full check in **My room · Passthrough**. There is no automatic real-table detection: move the virtual table to a comfortable clear position yourself.

1. Read `Pasa el balón hacia atrás.` Pinch the white ball, move it to the teammate on the left (away from the coral goal), then release near their feet. With controllers, use squeeze for this near grab. Check the backward-pass feedback.
2. Select **Next: shoot**. Read `Dispara a portería.` Move/release the ball into the coral goal. This first assisted exercise evaluates target placement, not throw velocity or realistic kicking physics.
3. Try the distance alternative: point at the **coral ring beneath the ball**, select it, then select the teammate or the coral goal. The ball should animate to that target. Selecting a target before the ball must do nothing. Choosing the goal during the pass instruction must show a correction, not success.
4. Reveal/hide **Translation**, reset after an off-target release, repeat both actions, then return to **Moment cards**. The original selected card should remain selected. Listening and demonstration are still available in the original cutback activity; this new slice has text instructions and feedback.
5. Move the pitch and instruction card independently using their blue handles; resize with the gold corners. Use peach grips for near manipulation and two-hand scaling. Repeat both actions after moving, rotating and resizing. Use **Reset layout** in playback controls to restore defaults.
6. Try while the match plays and while explicitly paused. Practice must never pause, seek, resume or dim it. Close while holding the ball, reopen, background/return, and temporarily lose tracking: no stuck grab or accidental completion should remain.

Emulator evidence: controller near grab/move/release produced backward-pass feedback; coral-ring ray selection, teammate selection, spatial Next button and goal selection completed both actions. Browser tests cover mistakes, optional translation, reset, close/reopen and playing/paused match independence. These do not establish real hand tracking, comfortable reach, passthrough alignment, resizing usability, Quest frame rate or language learning effectiveness. Spanish remains provisional.


## Minimal tabletop revision · 16 October 2026 · Device acceptance pending

Supersedes the placement-only gesture and large instruction panel described above. Open **Match Lab → Tabletop: pass + shoot**, in immersive VR and again in **My room · Passthrough**.

1. Select Barça, then Madrid in a separate run. Both teammates should share that team's shirt/trim. Check cream/lavender Playmaker surfaces, one goal, one card, and no cinema walls during practice. In passthrough the real room must remain visible.
2. Pinch a figure (controller: squeeze), lift and place it elsewhere on the pitch. Feet settle on the turf; the carrier's ball follows. Invalid/off-pitch or overlapping placements return to the previous position. Place the teammate ahead: a forward pass must not satisfy “hacia atrás”. Move pieces before selecting the ball.
3. Grab the ball and pull it 4–30 cm **away** from the intended target. Release when the blue guide points to the teammate. Tiny pulls should cancel without completing the exercise. Repeat for **Next: shoot**, pulling away from the goal. Check that the assisted arc and arrival are predictable. This is assisted aim, not a physical throw.
4. Try the fallback: select the ball's coral ring, then the ring by the teammate or the goal. Also try placing the held ball at a target. A wrong target must not advance the instruction.
5. Grab the instruction card by its exposed edge, move it and turn it over for English. Try **Flip** by ray. Check both faces' buttons, readable text, and two-hand resizing. Advancing/retrying should not wrench the card out of a held orientation. The face itself prioritizes UI selection; its edge is the near-grab area.
6. Move/rotate/resize the table with its handles and repeat a pass and shot. Check reach when seated, accidental figure/ball grabs, two-hand overlap, tracking loss, frame rate while the full match plays, and card readability against your real room. No actual Quest performance or hand-tracking acceptance yet.
7. Close with **Done** while the match is playing and while explicitly paused. Playback position must not change except normal progress; usual playback controls return. Reopen: the drill resets; the selected replay card remains pinned. Spanish wording/audio still awaits fluent review.

Managed controller emulation verified figure grab/reposition, carrier ball update, pull/release pass, spatial Next, pull/release goal, and card-edge grab/rotation. Automated evidence: 231 unit tests and nine affected browser tests, plus typecheck/build and scene validation. Emulation does not verify hands-only operation or physical-room placement.

## Team atmosphere · 16 October 2026 · Device acceptance pending

In both immersive VR and passthrough, choose FC Barcelona, enter Match Lab → Tabletop: pass + shoot:

- Turn right: a small stadium window and readable FC Barcelona banner should use blue/red team colors. Repeat with Real Madrid to check the light kit/banner contrast.
- Move the stadium with its blue handle; resize with its corner handle or two hands. Banner must move with the stadium. Check seated reach, legibility and frame rate while the full match plays. There is no automatic wall placement.
- Use **Switch to Minimal** on either card face: stadium, banner and handles disappear immediately; playback and your current exercise stay unchanged. **Team atmosphere** restores them without restarting a celebration. Close/reopen practice: the chosen mode stays for this session.
- Correct pass/shot: a small, silent confetti burst appears near the completed action and ends after about 1.6 seconds. Wrong target: no burst. Reset, Done or Minimal cancels any burst.
- Repeat with the match explicitly paused: toggling atmosphere must not resume it. Check that the added button fits the card and that edge grabbing/flipping still works.

Physical hand tracking, two-hand scaling, comfort and performance remain for Quest testing. Prototype Spanish/audio still await fluent Spanish review. Automated/model and controller-emulation evidence is recorded in IMPLEMENTATION.md.


## Minimal reset with table reveal · 16 October 2026

Historical table-reveal review, superseded by the card-only checks below. Earlier cinema/atmosphere checks are historical; `?sample=1` keeps the original calibration video and browser journey, with the minimal XR playback layout. Device acceptance is **pending**.

1. Open the secure development URL, choose FC Barcelona and **My room · Passthrough**, enter VR, then **Start match** in the dock. Expect one large screen and compact controls; no cinema, stadium window, banner or celebration. The table starts clear.
2. On a clear table with enough space for a roughly 80 × 51cm board, rest both open hands 18–65cm apart. With usable surface data, hold still for about 0.8 seconds: lavender outline, then pitch/card. Confirm it fits the actual table. This infers proximity and stability, not pressure.
3. If nothing appears, use **Adjust → Use hand height**, then hold both hands still at table height. This is explicit calibration, not room recognition. Alternatively **Place manually**, then adjust the board using its handles. Check small tables, poor tracking and unavailable room permissions; never silently present a manual position as a detected surface.
4. Lift your hands, look around and grab a player/card: the board stays fixed. Close: it must not instantly reopen under resting hands. Lift both hands clearly above the table, then rest them again. Tracking loss alone must not rearm it.
5. Move a teammate, pull/release the ball away from the target along its guide, complete the backward pass, select **Next: shoot** in the dock, then take the shot. **Flip card** is also in the dock; the physical card face is for reading and rotation. Test ray/target fallback too. Finger kicking is not implemented in this slice.
6. Choose **Cards**, grab the edge, rotate for English, try Flip, Replay, Listen, Save, Story and Next. One physical card remains selected while the match advances. **Try the pass** returns to the exercise. Prototype Spanish/audio await fluent review.
7. Move and resize screen, board and card; recenter the screen from Adjust. Repeat seated in Quiet space and passthrough. Check text reach, unintended grabs, double-video frame rate and recovery after removing/replacing the headset.
8. Repeat open/flip/practice/close with the main match playing and explicitly paused. Learning must not pause, seek, dim or resume it. Record actual device/browser, observed failures and comfort before marking acceptance.

Automated and managed-emulator evidence is recorded in the feature guide. It does not establish physical table detection, hand-only operation or performance.

### Retired-panel removal acceptance · 16 October 2026

- In the editor hierarchy and asset catalogue, confirm that the old welcome, watch, learning, explore, karaoke, coach and Match Lab dashboards and stadium are absent. Only the compact dock and physical practice card use spatial UI.
- On Quest 3, enter both Quiet space and passthrough, start the match, place the table, switch to Cards and close/reopen it. Confirm no old panels, dark screen frame, stadium or celebration appears, and playback stays independent.
- Open `?sample=1`, verify the original 30-second clip in the browser and XR. No Alba cards or tabletop invitation should appear for that unrelated sample. Physical-device acceptance is pending.


## Card-only match moments · 17 October 2026 · Quest acceptance pending

Current experience: large match screen, rounded physical moment card and a compact gesture menu. Tabletop, stadium and old dashboards are absent. Replay/Listen/Save are on both card faces. The palm gesture and animation have automated coverage; browser controller emulation does not establish physical-device acceptance.

1. Enter Quiet space, then repeat in passthrough. Play the local recording before 03:07: a small Before kick-off invitation should appear, rather than opening a card automatically. Select it for sourced historical context. No outcome spoilers.
2. Turn your left palm up and hold about 0.35 seconds: a cream pill shows Play/Pause, Moments and More. Turn away or lower the hand: the menu must remain open. Tap the compact Close (X) button to dismiss it; turn away and up again to reopen. Controller A/X is the fallback. Test accidental activation while holding a card, tracking loss and comfortable seated reach. The menu stays placed while choosing.
3. More → close card → Skip to moment, then watch through the action end. A single New moment pill should rise, briefly overshoot and settle, with one lavender glow. It disappears after six seconds, while unread moments remain under Moments with a coral badge. Selecting it opens the card without interrupting playback. Test reduced-motion preference: no rise/pop/glow.
4. Keep a card open while later moments arrive: its text and orientation stay pinned. Seeking ahead unlocks history quietly; seeking back does not repeatedly announce it. The original sample must receive no unrelated Barça cards.
5. Grab the cream edge, move/resize and physically rotate for English; use More → Flip card as fallback. Verify broad rounded outer corners and rounded artwork, cream front/back and a softly bevelled 20mm edge at authored scale, with no square overlays. Check Replay, Listen and Save as separate circular targets, with labels below and blue Listen. Keep fingers clear of action buttons when grabbing.
6. Replay uses the card's independent clip. Listen reports Playing; Save shows a checked bookmark and Saved on this device. Repeat all actions with the main match playing and explicitly paused. No learning action may pause, seek, dim or resume the match. Pregame replay/audio remain disabled when absent.
7. More → Mute match must silence the broadcast and alternate commentary while Listen still speaks Spanish. Unmute must restore match audio without seeking or pausing.
8. Screen/card move bars and resize grips remain visible without opening More; closing a card removes its handles. Confirm screen/card resizing and recovery after taking off the headset. Test text legibility, occlusion, accidental presses, audio overlap, two-video performance and the six-second invitation duration.

Automatic phone sync, physical phone/printed-card overlays, Quest hand comfort and fluent Spanish/audio review remain pending. See the [visual comparison](design/wrist-menu-2026-10-16/comparison.md) for implementation evidence and differences from the concept.

17 October verification: typecheck, 284 unit tests and build passed; final browser suite 35 passed, 2 skipped. Controller emulation verified invitation selection, Replay/Listen/Save feedback, menu/mute, squeeze-grab relocation and reverse-face visibility after a physical controller rotation. Hands-only acceptance remains pending.

### Palm-side placement correction · 17 October 2026

A user reported that the menu appeared on the back of the hand. Replaced finger-triangle winding and room-up/wrist offsets with the [WebXR joint palm-out direction](https://www.w3.org/TR/webxr-hand-input-1/#xrjointspace). The menu now starts 8 cm outward from the centre between the wrist and index/pinky knuckles. Placement still freezes on reveal, and the panel faces the viewer.

Verification: 286 unit tests, typecheck, build and 16 affected browser tests passed. Managed hand emulation showed palm-down hidden, palm-up visible, stable placement after moving the revealing hand, and right-hand-only reveal. This does not establish physical hand occlusion or Quest comfort. On Quest, repeat with each palm, tilt the palm, verify the panel is above the inside surface, then select with the other hand. Turning away must now keep the menu open; use Close to dismiss it. Do not accept a panel behind the wrist or on the back of the hand.


### Browser-style handles and persistent menu · 17 October 2026 · Quest acceptance pending

Screen and card expose a slim rounded cream move bar below the content, with a navy grip mark and warm bevelled edge. A rounded cream corner grip resizes uniformly. Near pinch/squeeze and distant ray pinch/trigger have separate interaction surfaces forming the same visual handle. Direct card-edge grabbing and physical flipping remain available. More is no longer needed to reveal screen/card handles. Menu placement tools remain under More.

The compact menu has a visible X close button. It stays fixed and open when the hand turns or leaves tracking; closing while palm-up cannot immediately reopen it. A fresh palm-away/up gesture or controller A/X reopens it. Starting the match also leaves the menu open until explicitly closed.

More includes My room and Quiet space. On a passthrough-capable device both launch choices use one immersive AR session; switching changes background opacity rather than ending/restarting the session. This follows the [WebXR alpha-blend contract](https://www.w3.org/TR/webxr-ar-module-1/#environment-blending). On VR-only sessions My room is disabled. Physical Quest passthrough composition remains to be tested.

Device verification: with each hand, pinch the middle bar, move and release; repeat with the corner grip to enlarge/shrink both screen and card. Verify a comfortable hit area, no duplicated visible bar, no interference with Replay/Listen/Save, and consistent cream depth on the reverse face. Close the menu with the palm still up, wait, turn away, then reveal again. Switch My room → Quiet space → My room while playing and while explicitly paused: retain video position/state, pinned card face, saved state and all window transforms, without another entry prompt. Repeat after exiting and re-entering the session. Spanish/audio still await fluent review.


Verification: typecheck, **295 unit tests**, production build and **16 affected browser tests** passed. Managed immersive AR emulation verified screen/card move, uniform corner resize and release using both near squeeze and distance trigger. Near targets exclude touch interception, and bars keep 18 cm of world-space clearance beneath the content even when resized. Hand emulation verified reveal, persistence through palm-away and tracking loss, explicit Close and reopening. Both More space choices updated the selected label while the match remained playing. These are emulator results; physical Quest pinch comfort and passthrough switching remain pending. The compact runtime review retained the cream/rounded visual treatment and independent main screen.


### Card-handle spacing correction · 17 October 2026

User Quest feedback showed the card bar visually detached after resizing. Replaced the card's fixed 18 cm clearance with a 5 cm local offset that scales with the card (2.5 cm at half size). The bar and corner grip continue following the card's transform on every frame. Screen/menu spacing is unchanged. A close grab candidate on dedicated manipulation chrome temporarily suppresses that hand's touch hover, restoring it immediately when the hand moves away, tracking is lost or the session releases. This avoids separating the bar from the card merely to avoid Replay/Listen/Save hover.

Verification: 297 unit tests, typecheck, production build and 16 affected browser tests passed. Emulated near squeeze verified card/screen move, resize and release with the closer bar. Distance resize checks measured proportional card-to-bar spacing at small and large scales. On Quest, repeat shrinking/enlarging and rotating the card, grab the close bar with either hand, then move back to Replay/Listen/Save and confirm touch selection still works. Physical acceptance remains pending.
