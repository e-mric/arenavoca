# Vega source-delivery verification

Reviewed: 2026-10-22. Source candidate: `78d66c5`.

A separate local Git clone of the committed tree was created at
`/tmp/arenavoca-vega-submission-78d66c5`, without copying the working tree or
installed dependencies. This proves the default original-media build does not
depend on the uncommitted Android/mobile/XR work or private recordings.

| Check | Result |
| --- | --- |
| Fresh Vega `npm ci` through `vega exec` | Passed |
| Original content preparation with FFmpeg | Passed |
| Native TypeScript check | Passed |
| aarch64 Release package build | Passed |
| Packaged MP4, final frame and three artwork hashes | Passed; exactly one MP4 |
| Fresh app `npm ci`, then the two Vega Vitest files | Passed: 10 tests |
| Documentation verification in the clean clone | Passed: 4 checker tests, 13 files / 134 local links |
| Original workspace scoped Vega tests | Passed: 10 tests |

Host tooling: the existing Amazon Vega SDK installation and its registry setup,
CLI 1.4.5 / SDK 0.24.12112. This is a clean source/dependency build, not a fresh
operating-system installation or offline build. SDK dependency installation emits
deprecation/audit warnings; no dependency upgrade was included in source delivery.

Release package: `app/native/vegaTV/build/aarch64-release/arenavocatv_aarch64.vpkg`.
SHA-256 of this build:

```text
cc4d0a25947579368501f4d6703a6978c290cc1406dbcd3a5be16bb8504d810a
```

Earlier official Vega simulator journeys covered both local media variants,
paused restoration, remote navigation and rendered EOF bounds. Those were not
rerun during this packaging-only task. Physical device acceptance remains open.

The signed-in Devpost management page was read on 22 October: Arenavoca is Draft,
1/5 steps complete. Pitch, project details, video URL and additional-info fields
remain empty. No form was saved or submitted. The repository owner will grant
judge access; the form specifies `testing@devpost.com` and `@AmazonAppDev`.

The [video scenario](amazon-video.md) and 263-word narration are prepared.
Four draft ElevenLabs speech generations were started with Nick Walker, voice
`KNJDgIur5F2M9nRqUsqB`, model `eleven_v4`, flow `vD6qISFzx0qyIU86Ci5z`.
The generation view reports completion independently; pronunciation, duration and
final take selection require listening. No edited or published video exists yet.
