# Interactive comic recaps: proposed roadmap

Reviewed: 2026-10-21. Status: the user subsequently authorized a bounded Alba prototype. A native phone comic and optional timed TV panels now implement the first experiment; see the [prototype guide](../../../app/src/features/stories/COMIC.md). Reusable rig/template production, live recognition and engine migration remain future exploration. Requirements stay in the [PRD](../../../PRD.md).

## Recommendation

Start with a vertical, colour webtoon-style recap inside the existing Android app. Manga/manhwa describes the visual and narrative treatment, not a required rendering engine. Keep ArenaVoca's cream, blue, navy, lavender and coral; establish an original visual language and consistent player/kit references. Mobile can scroll; TV should advance one panel at a time with the remote. Neither should interrupt the main match.

A recap is the best first experiment because the action sequence can be checked before publishing. A live companion could use approved reusable panels triggered by confirmed match events, with a measured delay. Generating coherent, accurate bespoke comics during play is a later experiment, not an established capability of the current detection pipeline.

## Stages and decision gates

| Stage | Bounded deliverable | Technology | Gate before expanding |
| --- | --- | --- | --- |
| 1. Editorial pilot | Alba run → cutback → finish, 4–6 panels, Spanish bubbles, optional English, source replay and one recall question | Current Kotlin/Compose UI, shared story JSON, PNG/WebP illustrations, existing replay files | Fluent review; action direction/identity/kit continuity checked; a small user comparison against the current cards |
| 2. Interactive reader | Tap a phrase for meaning, reveal the next panel, restrained parallax, optional sound, save/resume | Compose image/animation APIs on Android; shared story/state contracts for other clients | Large text, TalkBack, reduced motion, offline use, and Fire TV remote navigation work; user can read without animation |
| 3. Assisted authoring | Recording → timestamped evidence → structured storyboard → draft artwork → human approval → cached story pack | Existing Whisper/Qwen experiments as evidence inputs; RF-DETR/ByteTrack for supporting locations; an image-generation/editing API | Measure factual corrections, consistency, production cost and time per accepted story; never publish an unreviewed model interpretation as fact |
| 4. Optional live chapter | An approved event illustration appears after a confirmed pass/shot/goal; a coherent chapter is assembled at a break | Existing playback clock/event delivery, cached panel library, event confidence/status contract | No spoilers ahead of the viewer; late, duplicate, corrected and uncertain events handled; latency and false triggers measured |
| 5. Playable scene, if justified | A short drag-to-pass or choose-the-run scene within a recap | Evaluate Godot 2D as an embedded module against a small Compose prototype | A clear learning/interaction benefit outweighs another engine's lifecycle, accessibility, input and packaging costs |

These are ordered milestones, not calendar estimates or promises of model accuracy. Recognition quality on one Alba sequence does not establish reliable full-match event extraction.

## Godot decision

For illustrated panels, speech bubbles, translations, scrolling and simple motion, stay with Compose. It already provides image rendering and property/layout animation. Our recommendation is an architectural judgement based on the existing native app, rather than a claim that Godot cannot build a reader. [Android graphics](https://developer.android.com/develop/ui/compose/graphics), [animation guide](https://developer.android.com/develop/ui/compose/animation/quick-guide).

Godot is a sensible candidate when the panels become small games with animation timelines, collision, draggable actors or branching scenes. Its Android library supports embedding and communication with a host app, which also owns engine lifecycle. Browser export has additional WebAssembly/WebGL requirements; a web export is not a shortcut to native accessibility or TV acceptance. [Android embedding](https://docs.godotengine.org/en/stable/tutorials/platform/android/android_library.html), [web export constraints](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html).

## AI art workflow

Use a reference-aware image model to draft artwork and make targeted edits. A first candidate is the GPT Image API, which supports image inputs and editing. Choose the specific model after a small reference-consistency trial; no training run or new provider integration is necessary for the first hand-authored chapter. [Official image-generation guide](https://developers.openai.com/api/docs/guides/image-generation).

Create a small style sheet first: player silhouettes, kit colours, pitch orientation, line weight, lighting and a few expressions. Generate each approved panel against the same references; review ball direction, numbers of players and repeated identities. AI consistency is not guaranteed. Store source prompts, references and approved originals in Git, with private broadcast evidence kept outside it.

Keep dialogue and Spanish/English text as real UI layers rather than baking it into generated images. This makes text correctable, translatable, scalable and accessible. Store panel image, optional foreground/background layers, transcript, translation, source time range, hotspot areas and next-panel relationships in a shared story contract. Generate and cache assets before delivery; the phone should not need to wait for image generation during a lesson.

## First experiment

Compare the same Alba content as today's cards and as a six-panel recap. Observe whether users can retell the run/cutback/finish, recall one Spanish phrase and complete the recap without hunting for controls. Record comprehension, voluntary completion, perceived effort and production cost. Choose the format from that evidence before investing in a game engine or automatic live art.

## Reusable movement library (user proposal, 20 October)

Prefer a small validated action library before building a large catalogue. Start with run, receive, forward pass, cutback, cross, shot, save and celebration, with left/right attacking variants where needed. Each template owns player roles, ball path, timing, camera framing and supported poses. Match identity is separate: team colours, jersey pattern/number, skin tone and hair. A cutback must remain a backward pass after configuration; changing colours cannot correct wrong action geometry.

For flat comic panels, retain layered vector/raster source with masks for kit, skin and hair; recolour those deterministically. For animated scenes, use a shared rig and reusable clips, with material slots for appearance. AI can help author new templates, expressions, backgrounds and detailed kit artwork offline. Simple colour changes should not require a fresh generative edit: that risks changing anatomy, ball position or player identity unnecessarily. This is an architectural recommendation, not an implemented pipeline.

A first comparison could render the same three-action sequence with two team palettes, then check continuity, action clarity, editing time and accessible Spanish text. Cached variants could later support delayed live event illustrations; they would illustrate the action category rather than reproduce the exact broadcast. Keep exact-reconstruction claims separate from stylised summaries.
