# Amazon demo video — Barcelona–Madrid storyboard

Reviewed: 2026-10-23. This script replaces the previous fictional-team scenario.
Target: **2 minutes 15 seconds to 2 minutes 30 seconds**, including pauses for
readable interactions. English narration and captions. Use actual app footage
from the official Vega simulator; retain ArenaVoca's cream, navy, blue,
lavender and coral palette in editing graphics.

The user decided to include the short local match excerpt in Git so judges can
build and test without supplying a recording or relying on YouTube streaming.
The current working tree contains a 36-second, 1280×720 H.264/AAC clip at
`app/src/features/tv-learning/vega/media/barca-2018-alba.mp4`, and the default
Vega preparation script copies it into the app. At this check the clip is still
untracked: committing/pushing it and verifying a fresh-checkout build remain.
Claude owns playback repairs and clip preparation. Record against the finished
build; this storyboard check does not verify those runtime changes.

## Storyboard

These are editing targets, not measured narration timestamps. Match the final
audio to the actions and leave short gaps where a viewer needs to read the UI.

| Time | Actual footage / edit | Narration cue / purpose |
| --- | --- | --- |
| 0:00–0:10 | Briefly establish the official Vega simulator, then crop to the app. Title: “ArenaVoca · Spanish through sport”. | “What if watching football…” Introduce optional learning. |
| 0:10–0:24 | Barcelona vs Madrid, 28 October 2018, playing full screen. Display the source credit clearly. | Identify the real match and FC Barcelona's channel. |
| 0:24–0:38 | Show Alba's run, backward pass and Coutinho's goal. Use the actual sequence at normal speed; cut explicitly if separate clips are used. | Establish the three connected actions. |
| 0:38–0:50 | Open Moments with the remote. Show the available run, pass and goal rows after their actions occur. | The viewer chooses when to learn; nothing opens automatically. |
| 0:50–1:12 | Open “The pass back”. Keep the Spanish card visible, then reveal English with the TV control. Keep the main video visibly advancing in the same uninterrupted take. | “Alba pasa el balón hacia atrás.” Then “Alba passes the ball back.” Demonstrate the pinned card and independent playback. |
| 1:12–1:23 | Save the pass phrase and press Back to return to full-screen viewing. | Saving is optional; watching has no exercise gate. |
| 1:23–1:43 | In a separate take, open Saved → pass card → Practise. Show an incorrect answer, its feedback and a successful retry. | Reading becomes recall. Use the actual pass phrase, not obsolete capture material. |
| 1:43–2:05 | Show actual TV footage beside three brief labels: “React Native + Kepler”, “Video-driven moments”, “Local saves”. | Explain the implemented architecture and prepared-content boundary. |
| 2:05–2:15 | Return to watching, then a restrained closing title and source credit. Let the ending breathe. | “ArenaVoca. Watch. Notice. Remember.” |

## Match and learning content

Use [the prepared Barcelona source](../../app/src/features/stories/content/barca-2018-opening.json).
The sequence is Alba's run → backward pass → Coutinho's opening goal.

| Action | Spanish shown in the app | Broadcast match clock | Original recording position |
| --- | --- | --- | --- |
| Run into space | Jordi Alba corre al espacio. | 10:21–10:27 | 808–814 seconds |
| Pass back | Alba pasa el balón hacia atrás. | 10:27–10:30 | 814–817 seconds |
| Opening goal | Coutinho marca el primer gol. | 10:29–10:35 | 816–822 seconds |

These positions refer to the original recording. The current 36-second cut
covers recording 808–844 seconds; its card unlocks are 6, 9 and 14 seconds into
the clip. Recheck these against Claude's final cut if it changes. The overlapping
goal/pass ranges describe the same continuous move, not separate events.

Readable on-screen credit:

> Match footage: FC Barcelona YouTube channel
>
> Barcelona vs Real Madrid · 28 October 2018

Include [the official source upload](https://www.youtube.com/watch?v=WMjohb2tq7Y)
in the video description. The demo uses a bundled local excerpt sourced from
that upload; do not describe it as working YouTube streaming. The short excerpt
is intended for the judge repository; the full recording stays outside Git.

## Recording and editing handoff for Opus

- Record fresh Barcelona footage after Claude's playback/trim handoff. The old
  fictional-team captures, voiceover and demo export are superseded; do not reuse
  them as Barcelona evidence. Preserve historical files unless the user removes them.
- Confirm the short excerpt and the matching source/build changes have been
  committed and pushed, then verify the judge build from a fresh checkout.
- Capture 1920×1080, with a visible remote focus indicator. Hold readable states
  for at least two seconds and use normal playback speed.
- Capture the match/card/English interaction in one uninterrupted take. Record
  recall separately; use explicit cuts rather than stretching a short excerpt
  into an apparently continuous two-minute match.
- Check visible video pixels, audio, pause/Back behavior and phrase timing in the
  final build. Black/loading frames are not usable demonstration footage.
- Use real runtime UI. Generated concepts are not execution evidence. TV uses an
  explicit English control; phone hold gestures, its continuous comic reader and
  phone sync are not part of this Vega demonstration.
- The narration is [amazon-voiceover.txt](amazon-voiceover.txt). Use the new
  Barcelona voiceover and its audio-relative captions; add gaps and retime
  captions to the final edit. The time column above is only a planning guide.
- Keep the export below three minutes. Check pronunciation, caption accuracy,
  source credit and all claims against the final capture before publication.
  Spanish remains prototype copy awaiting fluent review.

## Voiceover handoff

ElevenLabs generation: 23 October, Nick Walker — Natural & Conversational,
model `eleven_v4`, four takes. The complete spoken copy is the linked text file;
no instruction tags or extra production notes are included in the spoken script.
[Open the narration takes](https://elevenlabs.io/app/flows/f5x03riVdOV0qak5fu1A).
All four completed takes are downloaded and decode successfully, with durations
94.88 / 93.84 / 93.28 / 95.04 seconds. The local editing folder is
`app/content-source/match-analysis/amazon-video-2026-10-23/`; start with its
`START-HERE.md`. It contains the storyboard, spoken copy, MP3s, provenance manifest
and take-01 SRT, word timings and paragraph beat CSV. The 254-word transcript
matches the script. Take 01 is a default edit input, not a listening-based ranking;
preview delivery and Spanish pronunciation before locking it. Retiming captions
is necessary after inserting pauses or choosing another take. The earlier
narration and subtitles do not match this script.

## Scope and remaining work

The demonstrated scope is prepared recorded football, optional illustrated
Spanish cards, English, local saves and recall. No live recognition or automatic
cross-device synchronisation is claimed. Playback restoration is omitted from
this cut so it does not depend on the outstanding playback repair.

The user will ask Opus to assemble the video. Final capture, editing, review,
publication and adding the public URL to Devpost remain separate steps; this
storyboard does not publish or submit anything.
