# ArenaVoca demo story

Five-minute English presentation for Emeric Van Frausum at [DevDay Exchange Community Brussels](https://luma.com/my26sz4n). The event includes project sharing and community demos; five minutes is the preparation format selected by Emeric. This script presents a working prototype and a learning process. Rehearse the first-person learning statements and adapt them to what you can comfortably explain yourself.

The central idea is **learning VR by building a place to learn Spanish**. Creative direction comes from your observations and decisions. Codex helps implement and investigate; engineering checks establish whether the intended behavior holds.

## Five minute speaker script

Read the paragraphs aloud. The italic cues are actions, not spoken text. The schedule includes quiet time for the demonstrations; keep each transition short.

### 0 to 30 seconds

*Show ArenaVoca with the match screen and a Spanish card.*

I’m Emeric. I’m a mobile developer, and VR is a new world for me.

ArenaVoca started with a question: could I enjoy a football match and practise Spanish around what was happening?

I’ve been building it with Codex. There are two learning processes here: learning a language through sport, and learning how to build an immersive experience myself.

### 30 to 75 seconds

*Show one image of the earlier browser-window approach, then the current spatial view.*

The first version put the match and learning content in browser windows. When I tried it in the Quest, I said: “It doesn’t feel like a VR experience.”

That reaction changed the direction. I wanted a large match screen, with learning options floating nearby, and the choice to see my own room.

I could judge the experience before I understood all the technology. Then I had concrete things to learn: where panels live in space, how people reach them, and how video gets onto the screen.

### 75 to 110 seconds

*Show the title and link for The Way of Code, with “Imagine → Build → Experience → Question → Verify → Refine” beneath it.*

Recently, I came across Rick Rubin’s The Way of Code. It gives me a way to think about the creative side of this project: start with an idea, explore it, and stay open to changing it.

My application of that is a hybrid approach. I use conversation with AI to make an idea tangible. Then I ask engineering questions: what should happen, what could go wrong, and how will we check?

### 110 to 165 seconds

*Demonstrate the spatial experience for about 25 seconds. Use a rehearsed Quest cast or a clearly labelled recording. Show the large screen, open the learning panel while playback continues, then show passthrough. A desktop emulator must be labelled as such.*

Here, the match is the main experience. Learning is something I choose alongside it.

Opening a phrase must leave the match playing. That preference became a precise rule in the code and a behavior we test.

One practical lesson was video access. Our YouTube embed couldn’t supply the video surface for this immersive screen, so this prototype uses a local recording.

### 165 to 225 seconds

*Switch to the Android emulator, prepared at Football → Explore match moments → Reveal match moments → The run, the pass, the goal. For about 30 seconds: show “Jordi Alba corre al espacio.”, play its eight-second excerpt, point to the translation, then open “Why this card?”. Do not navigate the entire lesson live.*

The next question was: can the learning come from the actual match?

This card connects a Spanish phrase to the action you can replay. There are six prepared cards and two stories so far.

We used a local speech model for commentary, and Codex inspected sequences of frames. The timings and observations stay with each card. It’s a selected, prepared batch; live generation is a future step.

### 225 to 270 seconds

*Show one simple example: “Return from background → replay stays paused.” Keep the passing test result available if someone asks.*

Here’s where engineering changed the result. A playback test caught a bug: returning to the Android app could restart a replay. We fixed it so playback waits for the user.

We also separate learning rules from the screens. Kotlin Multiplatform shares those rules between Android and iOS. The immersive app remains a separate web experience.

The useful loop is to make something, observe it, explain the behavior, and test the parts we need to rely on.

### 270 to 280 seconds

*Show the audience question, then advance to the warning.*

Spanish review and a recall experiment are next. Would you explore a phrase during the match, or save it for afterwards?

### 280 to 295 seconds

*Show Katie Dill’s talk as a reference. Keep its full video for after the five-minute slot.*

One warning: AI can make a prototype look finished very quickly. I still have to judge the experience and verify what matters. Katie Dill’s talk is a useful reminder to keep that standard.

### 295 to 300 seconds

*End on the LGTM slide. Its link is available for optional playback after the talk.*

Thank you. I’ll leave you with LGTM.

### Closing references and optional playback

The closing warning applies [Katie Dill’s talk, How to scale intent, quality, and artistry with AI](https://youtu.be/GLvFTMtw4Jk) to ArenaVoca: building quickly does not remove the need for product judgment. The publisher’s description emphasizes a clear point of view, understanding users, editing beyond the first draft and attention to detail. This is a paraphrase and our application, not a direct quotation. The full talk is 21:48.

The final slide links to [LGTM (Looks Good to Me), by Degenerative Pixels](https://www.youtube.com/watch?v=3TNpOD6bov8). The publisher describes a satirical music video about approving code under deadline pressure while review and testing suffer. It runs 5:05. No lyrics are included in the presentation.

Both links open YouTube and require internet. Full video playback is optional after the five-minute presentation; playing both in full adds 26:53. The slides preserve the order requested: Katie Dill first, LGTM last.

## Demo cues and fallback

| Moment | Prepare before speaking | If it does not work |
| --- | --- | --- |
| Earlier version | One actual screenshot of the browser-window prototype | Describe your headset reaction in one sentence |
| Spatial experience | A rehearsed 25-second cast sequence or local recording; identify whether it is Quest footage or emulation | Use labelled screenshots and continue within five seconds |
| Actual-match card | Android emulator already on the Alba card; optional private replay clips included | Show the illustration, Spanish and evidence; explain that the local replay is unavailable |
| Engineering example | A readable one-line behavior and the test file bookmarked | Explain the caught bug; no live test run is necessary |
| Finish | Repository link visible | Say “ArenaVoca on GitHub” and take questions |

The five-minute slot is too short for setup, headset handover, a complete quiz, F1, and the voice coach. Offer those as follow-up conversations. The phone does not automatically receive moments from a live headset session; introduce the mobile portion as a separately prepared companion pack.

Use [the Quest review instructions](QUEST_REVIEW.md) for a separate rehearsal. Passthrough visibility on the physical Quest has been confirmed by the user; hands-only acceptance, sustained playback, comfort and performance still need a full rehearsal. Keep automated Android inspection on the emulator. Do not install the Android CLI instrumentation helper on the physical phone.

A fallback recording of the demo has not been prepared by this script. Keep the broadcast excerpts local; the repository contains the original art and authoring tools, not the match video. If footage cannot be shown at the event, use the original sample for the spatial demonstration and the illustrated cards for the learning explanation.

## What The Way of Code contributes

Rick Rubin's work adapts the Tao Te Ching to a creative relationship with technology. The publisher describes starting from an idea and shaping it through making and modification. Use that as creative context, with attribution to [The Way of Code](https://www.thewayofcode.com/) and [its publisher](https://canongate.co.uk/books/5790-the-way-of-code-the-timeless-art-of-vibe-coding/).

The following connections are our interpretation for ArenaVoca, not a software method prescribed by Rubin:

| Creative practice | ArenaVoca example | Engineering practice that supports it |
| --- | --- | --- |
| Start from an experience you want | Watch sport with optional Spanish practice | Define that opening learning never changes match playback |
| Let the first attempt teach you | Browser windows did not feel immersive | Test spatial presentation on Quest and keep device evidence separate from emulation |
| Make a small useful version | Six cards from two selected passages | Preserve commentary, frame observations and recording ranges; validate the content contract |
| Refine through observation | Put the actual action beside each phrase | Check decoder progress, replay boundaries, single-player ownership and background behavior |

The project existed before this reference was introduced. Say “it gives me a way to think about the process,” rather than claiming it inspired the original idea. Keep the philosophy section brief and show your interpretation through the demo.

## Rehearsing what you learned

Explain these in your own words before using them as personal takeaways. If one is still unclear, make it a question you are exploring.

1. **Why did the first version feel wrong?** Separate your expectation of a place around you from having multiple browser windows. Describe the real-room passthrough you saw yourself.
2. **What does a spatial panel do?** Explain the difference between a panel positioned in the scene and a panel attached to the viewer's head. Rehearse the current placement controls rather than promising free dragging.
3. **Why do we use local video?** Explain the difference between displaying a publisher's embedded player and having video available to render inside the immersive scene.
4. **How do we know a card matches the footage?** Point to the source, recording range, commentary summary and visual observation. Explain why an illustration alone is not evidence.
5. **What did the replay test catch?** Backgrounding must clear the intent to play; preparing the video surface again must not silently restore that intent.
6. **What is shared across platforms?** The mobile learning rules are shared Kotlin. Android and iOS have their own views and players. The immersive web runtime is separate.

A good rehearsal experiment is to predict what a replay will do when the app goes into the background, explain why that matters, and check it on the emulator. Keep the distinction between having heard an explanation and being able to explain it yourself.

## Answers for likely questions

**What did you do and what did Codex do?**

“I brought the experience I wanted, tested it in the headset, and challenged what felt wrong. Codex helped investigate options, implement the features, author content and write tests. I’m using each change to understand more of the system.”

**Is AI generating these cards live?**

“Today they are a prepared batch from selected passages. Commentary was transcribed locally; Codex inspected nearby frames and authored Spanish content with evidence. Fluent Spanish review is still pending. Live generation is a future experiment.”

**Does it actually teach Spanish?**

“The prototype connects action to a phrase and offers recognition, recall and personal-use exercises. We still need to test retention and whether the learning distracts from enjoying the match.”

**Why Kotlin Multiplatform and a web immersive app?**

“We kept the working IWSDK/WebXR experience for Quest. Kotlin Multiplatform lets the mobile companion share learning rules across Android and iOS, while using native screens and video players. Other headsets need their own compatibility tests.”

**Are you using TDD?**

“We use focused automated tests for important behavior, including a test that exposed the replay-resume bug. I wouldn’t describe the whole project as strictly test-first. I want to use test-first work deliberately for rules such as quiz scoring, timing and playback intent.”

**What comes next?**

“Review the Spanish, rehearse the full headset journey, and test one learning question: does seeing the real action help someone recall the phrase later? Then expand generation based on those results.”

## Sixty second version

I’m Emeric, a mobile developer learning VR by building ArenaVoca with Codex. The idea is to watch sport and practise Spanish around the action.

My first headset reaction was that browser windows didn’t feel immersive. That pushed the prototype toward a theater and passthrough. Now the mobile companion also connects prepared Spanish cards to short replays of the actual match.

The Way of Code gives me a creative reference for experimenting with AI. My engineering contribution is to turn each intention into behavior we can explain and check. For example, a test caught replays restarting after the app returned from the background; we fixed that.

It’s still a prototype. My next question is whether these moments help people remember Spanish while enjoying the sport.

## Supporting material

- [ArenaVoca repository](https://github.com/e-mric/arenavoca)
- [Implementation evidence](IMPLEMENTATION.md), especially the actual-recording and inline-replay sections
- [Quest review](QUEST_REVIEW.md)
- [Android replay regression test](../app/src/features/stories/native/androidTest/MatchReplayTest.kt)
- [Canonical match-card content](../app/src/features/stories/content/barca-2018-opening.json)
- [Event agenda](https://luma.com/my26sz4n)
- [The Way of Code](https://www.thewayofcode.com/) and [publisher context](https://canongate.co.uk/books/5790-the-way-of-code-the-timeless-art-of-vibe-coding/)
