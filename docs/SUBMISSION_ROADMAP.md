# ArenaVoca submission roadmap

Updated 15 October 2026. Product authority: [PRD](../PRD.md). All unchecked work below is pending. This plan does not register, purchase, publish, contact organisers or submit. Emeric owns account/eligibility decisions and submission; Emeric and Codex prepare implementation, evidence and materials together.

Progress, 16 October: local benchmark preparation now runs on the Mac. The actual recording produced 373 planned windows and an unreviewed worksheet, with no inference or upload. [Usage and evidence](../app/src/features/match-recognition/README.md#full-recording-preparation--16-october-2026). The short-excerpt Ollama adapter and optional local Whisper path are also implemented with fixture/HTTP tests; [Windows commands](../app/src/features/match-recognition/README.md#local-ollama-adapter--16-october-2026) are ready. Match Lab now routes to the same local adapter with an explicit provider notice and no cloud fallback; [Windows service launch and Quest checks](../app/src/features/match-recognition/README.md#match-lab-local-service--16-october-2026) are documented. No actual local model has run, so Windows/Quest acceptance and the model smoke test/full-game execution gates below remain open.

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
| 15–22 October | Restore Windows checkout/media; run local-AI smoke set; verify Start status and project ownership; settle public-content approach and shortlist domain/host | Emeric: eligibility/choices; Codex: setup, evidence and drafts |
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
