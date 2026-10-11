# Morning Quest 3 prototype review

Milestone A is ready for device testing, but remains unverified. Use hands, stay seated, and test the 30-second sample before extending content. Keep the Mac awake and the server running.

## Choose a test route

### USB production build (no emulator)

Use this route if your Quest has developer mode and can authorize USB debugging.

```sh
cd /Users/emericvanfrausum/workspace/mecha/app
npm run build
npm run preview
```

In a second terminal, connect the Quest by USB, accept the debugging prompt in the headset, then:

```sh
npx metavr device list
npx metavr adb reverse tcp:4173 tcp:4173
```

Open **http://localhost:4173/** in Quest Browser. Loopback is treated as a secure browser origin, so this route avoids a local certificate. Keep the cable connected. With multiple devices, pass the desired serial through metavr's `-d` option. Enter VR requests hand tracking. If VR entry is unavailable, record the browser message rather than treating desktop rendering as a device pass.

### Wi-Fi HTTPS development server

```sh
cd /Users/emericvanfrausum/workspace/mecha/app
npm run dev
npm run dev:status
```

Put the Quest and Mac on the same Wi-Fi network. Open one of the **HTTPS network URLs printed by dev:status** in Quest Browser. The SDK uses a self-signed development certificate; the browser may show a one-time warning that you must handle yourself. `npm run dev:http` is a desktop-emulation helper, and its LAN HTTP URL is unsuitable for headset VR. The SDK's emulator activates on desktop rather than on the physical headset.

A published stable HTTPS origin is still a later hosting decision. Device-local progress belongs to an origin: `localhost:4173` and the Wi-Fi URL have different progress stores. Pick one route when checking reopening.

## About five minutes of hands-only checks

1. Select **Enter VR**, then **Start match** using hand pointing and pinch. The original simulation should play with English commentary. Watch one complete run without using the learning card.
2. Restart. At **12 seconds**, the pass card appears beside the match, through 20 seconds. Check that it does not overlap the video and that “balón” displays its accent.
3. Select **Explore action**. The match and commentary pause. Choose **Trace right hand** or **Trace left hand**, then move that index fingertip to the start of the pass route and follow the ball. The sentence unfolds in three chunks. Resting hands should not start tracing.
4. Lower the tracing hand out of tracking. Progress should freeze. Bring it back, or select **Replay action**. Replay must finish with the complete sentence still visible.
5. Select **Listen**, then **Save phrase**. Spanish must only play on request. Repeated Listen restarts one voice. Back stops it and returns to the paused video position. A previously playing match resumes.
6. Repeat Explore after you deliberately **Pause** the match. **Back to match** must leave it paused. Check the left/right panel setting and Recenter from the welcome/suspended screen.
7. Remove the headset or exit VR, then return. The app must offer **Resume match** or **Restart**. Close and reopen the same URL, then check **Resume previous** and **Your phrases**. Restart keeps the saved phrase.
8. After loading, disable the network and finish the clip. Confirm video, already loaded pronunciation, captions, and saving still work. Reopening offline is outside this checkpoint.

The first pass is a rough original animation with provisional AI speech. Please prioritize whether the interaction works and feels comfortable over decorative polish.

## Record actual results

Date/time: ______ · Route/origin: ______ · Quest Browser version: ______

| Check | Pass / Fail / Not tested | What happened |
| --- | --- | --- |
| Enter VR and Start with hands | Not tested | |
| Video and English commentary | Not tested | |
| Phrase/diagram match the pass | Not tested | |
| Accent and normal-distance readability | Not tested | |
| Controls comfortable while seated | Not tested | |
| Trace right / left hand | Not tested | |
| Tracking loss freezes progress | Not tested | |
| Replay reveals and retains all chunks | Not tested | |
| Listen only on request; no overlap | Not tested | |
| Back restores time and playback intent | Not tested | |
| Saved phrase survives browser reopening | Not tested | |
| Suspension requires deliberate Resume | Not tested | |
| Loaded-session playback without network | Not tested | |

Most uncomfortable control: ______
Was the learning card distracting? ______
Did tracing help connect the sentence to the action? ______

Frame rate, ten-minute comfort, three-person text readability, full six-target content, and release language review remain later acceptance work. No headset measurements have been claimed.
