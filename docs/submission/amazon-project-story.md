## Inspiration

Sports give language a context you can see: a player runs into space, a teammate makes a pass, a goalkeeper stops a shot. ArenaVoca started with a question: could those familiar moments make practising Spanish more engaging?

The central design principle is simple: watching comes first. Learning should be an invitation that viewers can choose when they are ready.

## What it does

ArenaVoca brings optional Spanish practice to the Fire TV experience.

The video fills the screen by default. After an action, a learning moment becomes available. Using the remote, viewers can open an illustrated Spanish card, reveal its English translation, save the phrase, and return to watching. The video continues while the selected card stays in place.

Saved cards lead to a short recall exercise with feedback and another chance to answer. Saved phrases and playback position remain on the device, and reopening the app restores playback paused.

The demonstrable Vega prototype uses an original illustrated football sequence with three prepared moments: a pass, a shot, and a save.

## How we built it

The TV app uses TypeScript and React Native with Amazon’s Kepler framework, the Vega media player, and local storage. We built and tested it on the official Vega simulator.

The video’s actual playback position determines which learning moments are available. Opening a card or revealing English does not send a pause or seek command to the player.

Codex helped with implementation, debugging, automated checks, and design iteration. AI image generation supported visual exploration and artwork in the broader project; the TV release bundles its prepared content and does not require an AI service to run.

Alongside the TV app, we experimented with recorded-match analysis. Gemini analysed video and commentary; local Qwen3-VL and Qwen3.5 models through Ollama analysed sampled frames, with and without Whisper commentary transcripts. RF-DETR Small with ByteTrack and Supervision provided player and ball detection and tracking evidence for comparison. These experiments explored how recorded actions could become timestamped learning moments. ElevenLabs generated learning audio, sample commentary and demo narration.

## Challenges we ran into

The biggest product challenge was balancing learning with attention to the match. We reduced persistent information, kept cards optional, and designed navigation around a TV remote.

The technical challenges included native video rendering during layout changes, reliable remote focus, and restoring progress without unexpectedly restarting playback. Testing actual simulator pixels exposed problems that layout measurements alone did not catch.

Video understanding presented a separate challenge. Models could produce convincing descriptions while missing a backward pass, repeating a goal or assigning the wrong timestamp. Adding commentary and tracking evidence did not consistently resolve those errors. We retained the experimental outputs separately from corrected, prepared content.

## Accomplishments that we're proud of

We built a working watch–understand–practise loop on Vega, with optional cards, on-demand translation, local saves, and recall feedback.

We also created an original demonstration sequence that can be included with the project, so judges can run the core experience without private match footage or API credentials.

## What we learned

A useful learning experience does not need to display everything at once. One relevant phrase, a clear illustration, and an optional translation can provide a focused interaction.

We also learned to verify media behaviour through both automated checks and visual inspection. A correctly sized UI container does not always mean the native video inside it is rendering correctly.

The recognition experiments taught us that detecting a player or ball is different from understanding the action. Plausible descriptions and valid structured output still need factual checks; Spanish wording and pronunciation also need fluent-speaker review.

## What's next for ArenaVoca

Next steps include physical Fire TV testing, accessibility improvements, and Spanish review by fluent speakers.

A separate mobile prototype explores optional vocabulary warm-ups and continuous comic-style recaps. Connecting saved TV moments to that companion is a future step.

Longer term, we want to improve and evaluate the recorded-match analysis experiments across more clips before attempting live coverage. The current Vega prototype uses prepared moments; it does not yet perform live match recognition or synchronise with a phone.
