# ArenaVoca live operating cost estimate

Prepared 15 October 2026. Planning estimates, not billing measurements or vendor quotes. Prices retain vendors' USD/EUR currencies, exclude taxes and free credits, and must be rechecked before purchase. No subscription has been purchased.

## Scope and assumptions

- One event means a two-hour broadcast window. Longer races, extra time, and pre/post-match coverage scale with duration.
- One shared analysis pipeline per identical broadcast/audio feed; reuse observations across viewers, then reveal them at each viewer's playback position. Different commentary feeds and user camera views can require separate processing.
- Twenty events per month, 100 viewers per event for the example budget.
- Hybrid analysis selects 60–120 twenty-second excerpts per event using event signals plus periodic sampling. This is an assumed operating policy, not measured coverage or accuracy. Event feeds will not identify every pass or cutback.
- Ten twenty-second replay clips delivered to every viewer per event. Replays require an authorised source and appropriate usage rights.
- One shared Spanish learning pack. Personal voice conversations, extra language packs, generated illustrations, engineering labour, moderation, and commercial content/data rights are outside the base budget.

## Model analysis benchmark

The saved Alba experiment used 2,717 input tokens, 772 response tokens and 1,353 reasoning tokens for 20 seconds of video with commentary. Reasoning must be included in output cost. The model response took 17.92 seconds; this is not full end-to-end latency.

[Google's global Gemini 3.8 Flash rates](https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing) list $0.75/$3.75 per million input/output tokens through December 2026, with promotional credits, and $1.50/$7.50 from January 2027. Do not assume promotional credit eligibility or immediate net billing; use the standard-rate column for budgeting.

Formula: `(2717 × input_rate + (772 + 1353) × output_rate) / 1,000,000`.

| Analysis policy | Requests/event | Promotional effective estimate | Standard-rate estimate |
| --- | ---: | ---: | ---: |
| One 20-second excerpt | 1 | $0.010 | $0.020 |
| Selected moments | 60–120 | $0.60–$1.20 | $1.20–$2.40 |
| Continuous coverage, 20-second windows every 16 seconds | approximately 450 | $4.50 | $9.01 |

Allow roughly $1–$4/event for selected-moment inference, or $7–$14/event for continuous inference, including a 50% contingency around these examples. A single clip is not a representative workload: output length, resolution, reasoning, extra context, and retries can change costs. This uses ordinary bounded requests, not a persistent Gemini Live API session. Benchmark a full recorded match before committing to a live service-level target. A single worker taking longer than the 16-second step cannot guarantee continuous coverage.

## Structured sports data

| Provider | Public entry price | Relevant limitation |
| --- | --- | --- |
| [API-Football](https://www.api-football.com/pricing) | $19/month, 7,500 requests/day | Verify competition/season/event coverage and permitted commercial usage. |
| [Sportmonks](https://www.sportmonks.com/football-api/plans-pricing/) | €29/month for five leagues, 2,000 calls/entity/hour | Historical data starts at a separate €29 one-time fee; confirm exact fixture availability. |
| [OpenF1](https://openf1.org/) | €9.90/month live personal-use tier; historical data since 2023 free | Unofficial; commercial use needs discussion with provider. Do not treat this as a commercial redistribution quote. |

One endpoint polled every 15 seconds for two hours uses 480 requests. Three separately polled endpoints use 1,440. Fetch centrally, not once per viewer. Simultaneous events, endpoint choices, daily limits, and provider update cadence determine the required tier. These feeds supply event/timing data, not a licence to a broadcast or necessarily a verbatim commentary transcript.

## Video delivery and storage

[Cloudflare Stream](https://developers.cloudflare.com/stream/pricing/) provides a concrete delivery benchmark: $1/1,000 delivered minutes; storage capacity costs $5/month per 1,000 minutes, purchased in blocks. Ingress and encoding are included. Buffering/preloading can add billable delivery.

| Consumption | Calculated delivery cost |
| --- | ---: |
| One viewer, full two-hour event | $0.12 |
| 100 viewers, one full event | $12 |
| 1,000 viewers, one full event | $120 |
| 100 viewers × 20 full events/month | $240/month |
| 100 viewers × 20 events × ten 20-second clips | $6.67/month |

Twenty full recordings occupy 2,400 minutes, requiring $15/month storage capacity if retained together. The example replay collection occupies about 67 minutes, fitting the minimum $5/month block. This is ordinary video delivery pricing, not a tested quote for stereoscopic/180°/360° streaming. Provider-side segment fetching, alternate cloud storage, and processing infrastructure need measurement in deployment.

## Small pilot budget

Companion experience with a separately available authorised broadcast, shared selected-moment analysis, and the replay usage above:

| Item | Monthly budget |
| --- | ---: |
| AI analysis, 20 events at $1–$4 | $20–$80 |
| API-Football entry plan | $19 |
| Backend, clip processing, database and logs | $20–$50 engineering allowance; not a measured hosting quote |
| Replay delivery | about $7 |
| Replay storage | $5 |
| Total | approximately $71–$161/month |

For personal F1 experimentation, add €9.90/month. Commercial F1 data remains unpriced. If ArenaVoca also distributes the full broadcast to those 100 viewers, add about $240/month delivery and approximately $10 more storage if retaining all 20 full recordings. Thus the technical example becomes approximately $321–$411/month before content rights. This is not an all-in launch budget.

Broadcast access, permission to analyse/store clips, replay redistribution, and commercial sports-data agreements are unresolved cost lines. They cannot be inferred from AI or CDN prices and may dominate the business model. Showing learning cards beside a user's separately played broadcast avoids ArenaVoca's full-video delivery bill, but does not by itself establish permission to ingest that broadcast or distribute clips.

## Development implications

Keep the recorded-as-live pipeline. Measure tokens, actual provider charge, clip-processing time, latency, rejected drafts and useful cards across a complete match. Use an explicit spending ceiling and bounded retries. Share source observations; perform light language adaptation separately. Keep a periodic visual sample as well as API-triggered excerpts so useful ordinary actions are not missed. Offer detailed AI conversation on demand rather than running a separate continuous model session for every headset.

At standard rates, continuous inference for 100 viewers separately would be about $901/event at the Alba token profile; sharing the same source analysis is about $9/event. Real-TV camera input is harder to share because each user's view and timing differ, making it a later, separately budgeted mode.
