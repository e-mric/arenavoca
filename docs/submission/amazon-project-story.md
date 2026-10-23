## Inspiration

Sports give language a context you can see: a player runs into space, a teammate makes a pass, a striker scores. ArenaVoca started with a question: could those familiar moments make practising Spanish more engaging?

The central design principle is simple: watching comes first. Learning should be an invitation that viewers can choose when they are ready.

## What it does

ArenaVoca brings optional Spanish practice to the Fire TV experience.

The video fills the screen by default. After an action, a learning moment becomes available. Using the remote, viewers can open an illustrated Spanish card, reveal its English translation, save the phrase, and return to watching. The video continues while the selected card stays in place.

Saved cards lead to a short recall exercise with feedback and another chance to answer. Saved phrases and playback position remain on the device, and reopening the app restores playback paused.

The Vega prototype bundles a 36-second cut of Barcelona vs Real Madrid (28 October 2018), from FC Barcelona's official YouTube channel, with three prepared moments: Jordi Alba's run into space, his pass back, and Coutinho's opening goal.

## How we built it

The TV app uses TypeScript and React Native with Amazon’s Kepler framework, the Vega media player, and local storage. We built and tested it on the official Vega simulator.

The video’s actual playback position determines which learning moments are available. Opening a card or revealing English does not send a pause or seek command to the player.

Codex and Claude Code helped with implementation, debugging, automated checks, simulator verification and design iteration. AI image generation produced the comic-style card illustrations; the TV release bundles its prepared content and does not require an AI service to run.

We also built an experimental YouTube-streaming variant. Inside the Vega simulator's WebView, YouTube playback stalls after a few seconds for any video, so the release bundles the short clip instead.

Alongside the TV app, we experimented with recorded-match analysis. Gemini analysed video and commentary; local Qwen3-VL and Qwen3.5 models through Ollama analysed sampled frames, with and without Whisper commentary transcripts. RF-DETR Small with ByteTrack and Supervision provided player and ball detection and tracking evidence for comparison. These experiments explored how recorded actions could become timestamped learning moments. ElevenLabs generated learning audio, sample commentary and demo narration.

## Challenges we ran into

The biggest product challenge was balancing learning with attention to the match. We reduced persistent information, kept cards optional, and designed navigation around a TV remote.

The technical challenges included native video rendering during layout changes, reliable remote focus, and restoring progress without unexpectedly restarting playback. Remote Play/Pause also conflicted with the platform's built-in player session after restarts, and the player could stop sending time updates; we let the app own the key and poll the playback position. Testing actual simulator pixels exposed problems that layout measurements alone did not catch.

Video understanding presented a separate challenge. Models could produce convincing descriptions while missing a backward pass, repeating a goal or assigning the wrong timestamp. Adding commentary and tracking evidence did not consistently resolve those errors. We retained the experimental outputs separately from corrected, prepared content.

## Accomplishments that we're proud of

We built a working watch–understand–practise loop on Vega, with optional cards, on-demand translation, local saves, and recall feedback.

Judges can install a prebuilt package or build from source: the short match clip and all card artwork are in the repository, and no API key or AI service is needed at runtime.

## What we learned

A useful learning experience does not need to display everything at once. One relevant phrase, a clear illustration, and an optional translation can provide a focused interaction.

We also learned to verify media behaviour through both automated checks and visual inspection. A correctly sized UI container does not always mean the native video inside it is rendering correctly.

The recognition experiments taught us that detecting a player or ball is different from understanding the action. Plausible descriptions and valid structured output still need factual checks; Spanish wording and pronunciation also need fluent-speaker review.

## What's next for ArenaVoca

Next steps include physical Fire TV testing, accessibility improvements, and Spanish review by fluent speakers.

We also want to sync saved TV moments with the ArenaVoca mobile app, which already offers vocabulary warm-ups and comic-style match recaps, and bring the same moments to Quest 3 in VR.

Longer term, we want to detect moments automatically by improving and evaluating the recorded-match analysis across more clips before attempting live coverage. The current Vega prototype uses prepared moments; it does not yet perform live match recognition or synchronise with a phone.
