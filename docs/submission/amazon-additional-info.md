# Amazon additional information — suggested answers

Reviewed: 2026-10-23. The testing instructions, feedback 1–3/5, AI tools, feature requests and friction-log link were entered and saved in the Devpost draft (1253573) on 23 October; the entry was not submitted. The canonical saved wording lives on Devpost. Personal declarations and subjective ratings need the entrant’s confirmation.

## Selections and links

| Field | Suggested answer |
| --- | --- |
| Submitter type | Individual, if entering alone |
| Organization | N/A, unless representing an organization |
| Country of residence | Enter actual residence; do not infer it from timezone |
| Canadian province | N/A if no entrant lives in Canada |
| Primary track | Fire TV |
| Repository | https://github.com/e-mric/arenavoca |
| New/existing before August 31, 2026 | New only if the project did not exist before then. First repository commit is October 12, which is supporting evidence, not proof of inception. |
| Existing-project changes | Leave blank if New; otherwise describe only work completed during the competition period |
| AWS Builder Mini Challenge | No; the current Vega target has no documented AWS-service integration |
| Required AWS description | N/A — not entering the AWS Builder Mini Challenge. |
| Open Source Mini Challenge | No for the current private, unlicensed repository; leave its optional follow-up fields blank |
| Project testing link | https://github.com/e-mric/arenavoca/blob/main/SUBMISSION.md |
| Upload file | Optional original-media Vega package or a ZIP containing it and run instructions, under the displayed 35 MB limit. Use a verified release; do not attach private match recordings. |
| Level of learning | Significant if this reflects the entrant’s experience |
| Career value from AI | Yes if this reflects the entrant’s experience |

The private repository must be shared with `testing@devpost.com` and `@AmazonAppDev` as stated in the form. The owner handles that access. Confirm age, eligible jurisdiction and employment declarations personally.

## Testing instructions

Follow SUBMISSION.md in the repository to build and launch the original-media Vega release on the official Vega simulator. No app account, API key, or private match footage is required. Start Blue vs Amber, watch until the pass becomes available at 8 seconds, then open Moments → The pass. Reveal English, save the phrase, and return with Back. The shot and save become available at 20 and 28 seconds. Open Saved → a card → Practise to test recall and feedback. Close and reopen the app to check local saved phrases and paused playback restoration. Amazon’s Vega SDK and dependency-registry access are required to build.

## Feedback 1 — tools, APIs and SDKs used

Amazon Vega SDK and CLI were used to scaffold, package, install and run the TV application on the official Vega Virtual Device. React Native and Amazon’s Kepler framework provide the UI and remote navigation. The W3C media VideoPlayer handles video playback and timing events; AsyncStorage stores saved phrase IDs and playback position. TypeScript and Vitest cover the learning and persistence rules. Appium with Amazon’s Kepler driver exercises the real simulator using remote key events and screenshots. Pillow and FFmpeg produce the original demonstration sequence and video assets. Codex assisted development and verification; ElevenLabs provided demo narration.

## Feedback 2 — what worked well

The Vega CLI provided a repeatable path from source to an installed simulator package. React Native allowed the TV experience to use familiar component and state patterns, while Kepler exposed remote events and focus behaviour. Media-player timing events let learning moments follow actual playback rather than a separate timer. AsyncStorage was sufficient for this prototype’s local progress. Appium made it possible to repeat real remote-navigation journeys and compare visible states. TypeScript and the pure tests helped keep availability, saving and recall behaviour separate from platform integration. FFmpeg made the original media reproducible, and ElevenLabs provided a usable narration workflow.

## Feedback 3 — what needs work

Native video resizing is the most significant issue encountered. The UI container can report correct dimensions while the video retains stale scaling, especially across paused or ended states. Recreating the surface during pause can clear the visible frame, so a documented resize-safe example and a regression test would help. Additional friction included local asset URLs resolving as file:///pkg/... while this playback path expected /pkg/..., hidden generated asset folders being omitted during packaging, and warnings from unused SDK media controls. Clearer end-to-end examples covering bundled media, resizing, focus, paused restoration and release packaging would reduce iteration time. Appium’s nested JSON-RPC argument shape also needed experimentation. Codex-generated changes still required native typechecking, real-device-path testing and visual review.

## Feedback 4 — onboarding experience

Onboarding required installing the Vega SDK and its macOS prerequisites, setting up the SDK environment, downloading the virtual device and ensuring sufficient disk space. Once the toolchain was available, the CLI could build and launch an application on the simulator. Moving from hello world to a working media app required additional investigation into package assets, local media paths, remote input and Appium. A single maintained sample combining bundled video, an optional side panel, local progress and simulator automation would have shortened that transition. Familiarity with TypeScript and React helped with the application layer; the platform-specific media and testing behaviour took the most iteration.

## Feedback 5 — would you use these again?

Suggested wording, subject to the entrant’s own opinion:

Yes. Vega and Kepler make it possible to build a focused TV experience using a familiar React Native workflow, and the official simulator is valuable when physical hardware is unavailable. I would use them again for a TV prototype, with earlier testing of media-surface behaviour, remote focus and accessibility. Before a production release I would also test on physical Fire TV devices. Codex and ElevenLabs were useful development and presentation tools, with generated work reviewed against actual application behaviour.

## AI tools used

OpenAI Codex assisted with implementation, debugging, automated tests, documentation, visual frame inspection and drafting Spanish learning content. Google Gemini supported experimental analysis of recorded football video and commentary. Local Qwen3-VL and Qwen3.5 models through Ollama analysed sampled match frames, with and without commentary transcripts. Whisper provided local transcription through MLX-Whisper and faster-whisper. RF-DETR Small with ByteTrack and Supervision supported experimental player and ball detection, tracking and visual inspection. OpenAI image generation produced original illustrations, comic/manhwa artwork, interface concepts and learning assets. ElevenLabs generated Spanish learning audio, sample commentary and demo-video narration. Recognition outputs contained factual and timing errors and require review. The submitted Vega app runs with bundled prepared content; it does not call an AI model at runtime or perform live match recognition.

## Optional feature requests

Important: Provide an official VideoPlayer example that resizes a persistent video surface between full-screen and a side-panel layout while playing, paused and ended, without changing playback position or losing the current frame. ArenaVoca needs learning controls to remain independent from playback.

Important: Provide one maintained bundled-media example covering supported local URI formats, asset packaging, remote focus, AsyncStorage restoration and Appium remote events. This would reduce the gap between hello world and a testable TV application.

## Optional friction log

The form expects a URL, not pasted prose. The current SDK findings are documented at https://github.com/e-mric/arenavoca/blob/main/app/src/features/tv-learning/vega/README.md#integration-findings. For a dedicated friction-log entry, include each reproduction, severity, workaround and actionable suggestion; do not claim the optional bonus solely for linking a general README. Judge access is required for this private link.
