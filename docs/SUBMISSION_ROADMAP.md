# ArenaVoca submission roadmap

Updated 16 October 2026. Official submission requirements below were last reviewed 15 October; this update adds development/testing lessons, not a fresh eligibility review. Product authority: [PRD](../PRD.md). All unchecked work below is pending. This plan does not register, purchase, publish, contact organisers or submit. Emeric owns account/eligibility decisions and submission; Emeric and Codex prepare implementation, evidence and materials together.

Progress, 16 October: local benchmark preparation now runs on the Mac. The actual recording produced 373 planned windows and an unreviewed worksheet, with no inference or upload. [Usage and evidence](../app/src/features/match-recognition/README.md#full-recording-preparation--16-october-2026). The short-excerpt Ollama adapter and optional local Whisper path are also implemented with fixture/HTTP tests; [Windows commands](../app/src/features/match-recognition/README.md#local-ollama-adapter--16-october-2026) are ready. Match Lab now routes to the same local adapter with an explicit provider notice and no cloud fallback; [Windows service launch and Quest checks](../app/src/features/match-recognition/README.md#match-lab-local-service--16-october-2026) are documented. The subsequent [Windows pilot and accuracy follow-up](WINDOWS_LOCAL_AI_2026-10-16.md) measured actual local inference and verified desktop Match Lab delivery. Raw action/timing errors remain; a larger-model comparison still missed the cutback and was too slow for the live step. Keep the reviewed prepared pack for demonstrations. Physical Quest acceptance, fluent Spanish review, and full-game evaluation remain open.

## Current XR priority: virtual moment cards

Decision, 16 October 2026: keep the large match screen and virtual illustrated cards. The tabletop is deferred. Implement Replay, Listen and Save on the card, physical flipping for translation, and a small palm-revealed Play/Pause, Moments, More menu with a controller fallback. Validate hand tracking, accidental activation, near selection, readable text, grabbing and two-hand resizing on Quest 3 before expanding the interaction scope. Local Save preserves source identity, timing and learning content; automatic mobile synchronization is a separate delivery item.

### Later experiment: physical card surfaces

These are optional research prototypes, not dependencies for either submission and not implemented:

- **Printed card:** track a known marker on each face and align the Spanish/English virtual card to it. Start with one matte card; compare tactile flipping against the virtual-only baseline.
- **Phone:** track a marker shown on the screen or attached to a case. Consider optional touchscreen controls only after alignment works. Pairing the phone does not by itself provide its spatial pose.
- **Feasibility gate:** verify camera access and marker pose estimation in the exact Quest Browser/IWSDK deployment before committing to a platform change. Camera access is not automatic arbitrary-object tracking. [Meta camera overview](https://developers.meta.com/vr/documentation/unity/unity-pca-overview/).
- **Acceptance:** measure jitter, latency, occlusion by fingers, recovery when flipped or out of view, reflections, comfort and frame rate. Use markers on both faces for a flip trial. Hide an unreliable overlay instead of leaving it attached to the wrong place; retain a virtual-card fallback.
- **Decision:** only promote the experiment if it makes reading/flipping more useful without making setup or tracking noticeably worse. The virtual-only experience stays complete.

### Saved moments on mobile

- [ ] Add explicit pairing/account ownership and a versioned cross-device saved-moment contract.
- [ ] Sync source IDs, recording ranges, text, artwork references and learning progress with offline retry and deduplication.
- [ ] Resolve replay availability on mobile separately; a local recording path is not a transferable video URL.
- [ ] Show local-save success separately from successful phone sync; test replay access and deletion on both devices.


## Official requirements and dates

### Meta VR Start Developer Competition 2026

Deadline: **18 November 2026, 12:00 PST / 21:00 Europe/Brussels**. Winners expected around **11 December**. The submitting person needs Start membership and developer access. Confirm age/residence and funding eligibility; separate Meta development funding can disqualify a project. New Experience requires conception/build within the window beginning 24 September; verify history before choosing it. Entertainment is our proposed track. Identifiable non-entrant people, corporate branding and third-party rights are restricted. Entrants retain ownership but grant broad perpetual evaluation/promotional rights. [Official rules](https://start-developer-competition-26.devpost.com/rules)

IWSDK/WebXR hosted builds are accepted. Hands must work end-to-end; judges use Quest 3/3S. Prepare a public YouTube/Vimeo demonstration **under three minutes**, English entry materials and a project description covering inspiration, construction, future plans and launch timing. Keep the submitted build accessible and unchanged from the deadline until winner announcement; an announcement delay extends our freeze. [Official FAQ](https://start-developer-competition-26.devpost.com/details/faqs)

### No Excuses Fund, first cohort

Deadline: **15 December 2026**; decisions **15 January 2027**. Advertised grants are $10k/$50k/$100k, within a total fund of up to $1M. Existing working products are welcome. [Programme](https://noexcuses.get.tech/)

Times default to US Pacific; the reviewed pages give no exact closing hour. Applicants must be adults, eligible by legal residence, and pre-Series A; Belgium is not excluded. Disclose financing and material changes. The actual primary product must operate on a founder/team-owned `.tech` domain, not a redirect or informational landing page. After payment, retain it generally for 24 months; an unresolved move can trigger repayment. IP stays yours; publicity rights generally last three years. Resolve employer/client ownership claims. Cooperate with verification requests within three business days or an agreed extension. [Terms, sections 1–5 and 9](https://noexcuses.get.tech/terms)

**Dual-entry interpretation:** no explicit prohibition on entering both was found. This is not organiser confirmation. Recheck terms and any award agreement before acceptance; disclose relevant awards/funding rather than assuming eligibility is permanent.

## Delivery milestones

These are our internal targets, not extra organiser requirements. Scope reductions must preserve a complete, honest demonstration.

| Target, Europe/Brussels | Deliverable and exit evidence | Owner |
| --- | --- | --- |
| 15–22 October | Restore Windows checkout/media; run local-AI smoke set; investigate connected-Quest tooling and establish a one-card interaction baseline; verify Start status and project ownership; settle public-content approach and shortlist domain/host | Emeric: eligibility/choices; Codex: setup, evidence and drafts |
| 23–31 October | Complete local-provider integration and attempt resumable full-match benchmark; produce approved public action pack; choose live-generation or prepared demonstration mode from measured results | Joint build/review |
| 1–8 November | Rehearse complete hands-only Quest loop in both environments, get Spanish review, collect a small consented pilot and fix usability failures | Emeric: device/pilot; fluent reviewer: language; Codex: fixes/report |
| 9–15 November | Prepare hosted release candidate, source/asset manifest, screenshots, competition video and English Devpost copy; verify from a fresh Quest browser session | Joint preparation |
| **16 November** | Internal Meta ready-to-submit review; confirm all blockers closed and recheck rules | Emeric: decision; Codex: material/checklist support |
| **18 November, before 21:00** | Official Meta deadline; submit only when authorised and retain receipt, commit and URL | Emeric |
| 19 November–actual winner announcement | Preserve competition release; continue product work and benchmark/pilot analysis on a separate deployment | Joint |
| By 7 December | Product runs on selected `.tech`; draft startup case, budget/use of grant, costs and evidence | Joint |
| **14 December, 18:00** | Internal No Excuses ready-to-submit target, ahead of 15 December Pacific deadline | Emeric: decision; Codex: preparation |
| **15 December** | Official first-cohort deadline; retain submission receipt | Emeric |
| Through **15 January 2027** and any verification | Keep product available, watch for verification requests and review award obligations if selected | Emeric |

## Immediate gates

- [ ] **Eligibility:** Emeric verifies Start membership/developer access, age/residence, development dates and any existing funding/ownership agreements. Save evidence privately, not identity documents in Git.
- [ ] **Public-content decision by 22 October:** prepare a request for written Meta clarification if real match footage is desired. No answer is not approval. Default to an original unbranded football sequence with fictional players and original commentary. Keep the Alba recording as a private development benchmark; the local download does not establish public rights. Audit visible team names, player names, logos, thumbnails, replay frames, captions and deck/video excerpts too. A rights-cleared broadcast still needs assessment against Meta's separate person/branding restrictions.
- [ ] **Original pack by 31 October:** align footage, replay boundaries, Spanish/English cards, story, pronunciation and quiz answers. The current sample is a starting asset, not a completed pack. Preserve source/provenance and confirm rights to distribute every asset.
- [ ] **Model decision by 31 October:** complete the smoke set before full-game execution. Record coverage, incorrect/missed actions, replay false positives, Spanish/story review, p50/p95 latency, memory and cost per recording hour. Distinguish energy estimates from measured energy and cloud estimates from billed charges. If generation is unreliable, freeze reviewed prepared content and keep evaluation separate. Do not claim the Alba success establishes full-game accuracy.
- [ ] **Domain decision:** Emeric chooses/authorises purchase of an available `.tech` domain and accepts the commitment. No domain is reserved by this plan. Deploy the actual web experience there; the mobile app can remain a companion.

## Meta preparation checklist

- [ ] One short complete loop: enter with hands, start match, open Match Lab, inspect replay, grab/flip/resize card, practise action, save, recall and exit. Match playback remains independent; pause/seek only through explicit playback actions.
- [ ] Physical Quest evidence for theater and passthrough: readability, reach, hand reliability, layout reset, two-video performance, comfort and recovery. Record device/build/date and failures in [Quest review](QUEST_REVIEW.md). Keep untested hardware and browser-only evidence distinct.
- [ ] Fluent Spanish review of released text, translations and audio; record review status. Current prototype audio is still awaiting review.
- [ ] Typecheck, feature tests, build and affected browser tests on the release commit. Add documented Quest-only cases for hardware behaviour.
- [ ] Hosted release loads without local files, the Windows GPU server, developer credentials or a required phone. Prepared mode stays functional without AI connectivity. Any public inference service needs its own authentication, request bounds and budget before exposure; never publish the development gateway or Ollama directly.
- [ ] Actual product screenshots and an under-three-minute edit: suggested 20-second problem, 100-second Quest demonstration, 35-second implementation/evidence and 15-second limitations/next step. This 170-second outline is our proposal, separate from the five-minute community talk.
- [ ] English Devpost copy, testing instructions, track/division, build link, launch target, asset/licence inventory, model/data disclosure and honest limitations. Audit presentation memes and third-party videos separately; do not automatically reuse the community deck.
- [ ] Release manifest: commit, dependency lockfile, deployed URL, asset hashes, approved content version, test report and demo-video link. No credentials, private recordings or extracted frame sequences in Git.
- [ ] Final rule review, authorised submission and saved receipt. Registration/submission status is unverified until evidence exists.

## Quest interaction testing gate

Priority: start after the bounded Windows Alba smoke test, with the first baseline targeted for 22 October; repeat fixes during the 1–8 November hands-only rehearsal. Use the private Alba source for development and the approved original pack for public submission evidence. This expands the existing interaction acceptance work, not the feature scope.

- [ ] **Tooling capability:** inspect the installed IWSDK tooling and verify whether connected-Quest runtime inspection/input/performance capture works in this project. Meta documents this workflow in its [IWSDK 1.0 announcement](https://developers.meta.com/vr/blog/immersive-web-sdk-1-0/); do not infer availability from the video alone or silently upgrade dependencies. Record supported commands and any blocker in the existing setup/review docs. Manual physical testing can proceed if automation is unavailable.
- [ ] **One-card repeatable scenario:** in the emulator, exercise grab, move, release, flip to translation and back, listen, and replay; test window resizing and layout recovery. Assert that opening/closing learning surfaces and manipulating cards never pause, seek, dim, or resume the main match, and that the selected learning item remains pinned. Debugger engine stepping is only for isolated diagnosis.
- [ ] **Physical Quest 3, both modes:** repeat the scenario in theater and passthrough with real hands. Record readability, reach, flip/grab reliability, accidental selections, lost tracking/recovery, comfort, and performance while match and replay video are active. Save build/commit, device/browser/SDK versions, input method, steps, failures, measurement method and results in [Quest review](QUEST_REVIEW.md). Do not import another demo's frame-rate result as our target or measured outcome.
- [ ] **Independent review:** request a separate review of visual clarity and interaction feedback against the scenario; fix the most consequential failure and repeat it. Keep reviewer suggestions, automated device execution, and Emeric's comfort observations distinct. A screenshot or injected interaction is not proof of natural hand usability.
- [ ] **Evidence for the demo:** retain one before/after example of a failure diagnosed through scene state or headset feedback. Explain what the AI built, what the tests established, and what the human headset test changed. Label prepared versus freshly generated content and retain fluent Spanish/audio review as a separate gate.

Reference and learning notes: [IWSDK live-build lessons](wiki/immersive-lessons.md#lessons-from-the-iwsdk-live-build). These tasks are pending; no new Quest test was performed while writing this plan.

## Future real-TV camera investigation

After the protected submission work; not a prerequisite for the recorded-match demo. The [current camera guide](https://iwsdk.dev/guides/13-camera-access.html), reviewed 16 October, limits `CameraSource` to browser-exposed `MediaDevices` cameras and explicitly excludes direct access to Quest passthrough imagery/raw tracking-camera frames. This qualifies the broader answer in the live session. See [the wiki distinction](wiki/recognition.md#camera-access-is-a-separate-capability-gate).

- [ ] On the intended hardware/browser, record whether a suitable `videoinput` is exposed and whether permission-based frame capture works. Handle absent input and denied permission. Do not infer access from passthrough visibility or platform hand tracking.
- [ ] If a usable capture path exists, evaluate TV framing, glare, resolution, latency, commentary acquisition and video/audio timing separately from action recognition. Require explicit capture intent and document where frames/audio are processed and retained before connecting inference.
- [ ] If the browser exposes no suitable input, record the blocker and evaluate a separately supported capture integration. Do not promise real-TV recognition on Quest or future glasses without device evidence. Keep the recorded-video provider path working independently.

## Tabletop Match Lab delivery

**Active reset, later 16 October:** the approved first implementation slice now replaces the primary recorded-match XR layout. The user selected the [minimal storyboard](design/vr-reset-2026-10-16/README.md) with a large screen and a tabletop revealed by resting both hands. The prior implementation/checklists below describe the old build, not approval to extend its atmosphere. Next acceptance gate: test the implemented reveal/keep-open/close flow and one pass/shot on physical Quest. Optional finger kicking remains a separate experiment. Preserve manual/controller fallbacks. Stadium windows, banners, cinema scenery and decorative celebrations are retired from the active design.

Requested 16 October: execute Spanish instructions using miniature football characters and F1 cars. [Product requirements and action catalogue](../PRD.md#tabletop-match-lab-direction--16-october-2026) · [Design/tooling notes](wiki/tabletop-match-lab.md). The original player/pitch pass-and-shot slice is implemented and emulator/browser checked; the full action catalogue and physical Quest acceptance remain pending.

- [ ] **First football slice — implementation ready for device review:** minimal miniature pitch, two grabbable teammates in the selected team kit, ball, goal and one physical bilingual card; backward pass and shot with pull/release aim assistance, fallback selection, deterministic feedback, retry and reset. Mobile Playmaker surfaces and minimal VR/passthrough are implemented. Listening/demonstration remain in the original cutback activity; new tabletop voice is deferred. Preserve the independent main match and existing prepared-card fallback. Prioritize this within the existing 23–31 October interaction work; cut breadth if necessary to protect the November Quest rehearsal.
- [ ] **Asset trial — local GLTS export integrated:** original player/pitch exported via Drawcall; AI generation denied for missing entitlement. Establish source ownership, editable output, compatible lifecycle and Quest performance before adopting a new dependency. No framework migration or paid-service dependency is required by this plan.
- [ ] **Verification:** unit tests for action rules and misleading gestures, browser tests for exercise/card/playback independence, and physical hands-only trials in theater and passthrough. Manual tabletop placement first; automatic real-table alignment is a separate capability. Measure language help separately from motor assistance and get fluent review of instructions.
- [ ] **Football expansion after acceptance:** running with the ball, keeper saves and deliberate celebration. Add meaningful completion criteria for each; do not count an animation triggered by the wrong action as comprehension.
- [ ] **F1 follow-on:** reuse exercise state/feedback contracts for overtaking and pit entry, then braking and celebration with distinct track/vehicle rules. Keep a coherent original visual style. Full F1 parity is not required for the first football submission loop and must not displace its acceptance work.

## No Excuses preparation checklist

- [ ] Working `.tech` product with clear entry instructions, appropriate content, functioning saved-card/recall flow and stable hosting. Test from a fresh device/network.
- [ ] Concise product story: audience, unmet need, what exists, why sports context helps and what spatial interaction adds. Present learning improvement as a hypothesis unless supported by the pilot.
- [ ] Real feedback with participant count/method, observed usability issues, immediate/delayed recall where measured, and next validation step. Do not invent demand or describe friends' comments as retention data.
- [ ] Full-game/local-AI report or explicitly scoped partial result with missing coverage; compare cost and factual quality fairly. Identify what runs locally, what needs cloud services and what was manually corrected.
- [ ] Mobile recap demonstration with manual import/device-local progress disclosed; no claim of automatic sync or equal iOS/Android verification without evidence.
- [ ] Practical use-of-funds proposal: content rights, language review, inference/hosting, user research and product polish. Separate forecast from actual expenditure; no assumed grant award.
- [ ] Founder/project ownership, contributor/asset rights, funding disclosures and requested verification materials. Supply only project-scoped read-only repository access if requested; keep sensitive documents private.
- [ ] Recheck the live application form and current terms for additional fields; final review, authorised submission and receipt. Keep the website available during evaluation; review payment/tax/domain duties if offered an award.

## Release strategy and scope protection

Use one codebase with an immutable competition deployment and a separate evolving product deployment. Proposed paths on the chosen domain: `/competition/2026/` and the main product root; these are plans, not existing URLs. Freeze content packs and model-derived outputs too, so changing a backend cannot silently change the judged experience. Keep source, hosting and media accessible until the actual announcement. Record any emergency incident; seek organiser guidance before altering the judged build.

If time runs short, reduce content quantity, cosmetic work and optional coach features first. Preserve useful hand interaction, playback independence, a complete recall loop, reviewable evidence and stable access. Keep live ingest, paid sports APIs, camera recognition, model training, additional headset ports and automatic sync after the submission milestones. Continue the same timestamped observation pipeline when later adding live sources; do not redesign the product around the application form.

### Historical team atmosphere · 16 October · superseded by design reset

Implemented for the football tabletop slice: movable/resizable stadium diorama, selected-team banner, silent success celebration, and session-retained Minimal mode. The atmosphere never controls match playback. The retired design had proposed [team atmosphere Quest checks](QUEST_REVIEW.md#team-atmosphere--16-october-2026--device-acceptance-pending), especially two-hand resizing, readable banner colors, and full-match frame rate. F1 atmosphere and real-room anchoring remain deferred.
