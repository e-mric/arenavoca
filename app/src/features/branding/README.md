# ArenaVoca icon

The mark combines an arena, a speech bubble and a play symbol. The shared cobalt, coral and ivory palette connects the mobile Playmaker design with the immersive Matchday experience without tying the icon to one sport.

`artwork/arenavoca-icon-master.png` is the selected continuous arena icon, used in Android, iOS, the web favicon and the demo slides. It is an exact copy of `artwork/continuous-arena.png`, chosen by the user on 13 October 2026. The earlier design is preserved as `original-arena.png`; `conversation-first.png` and `compact-arena.png` remain available as alternatives. Generation prompts and method are recorded in `artwork/prompts.json`.

Android launcher PNGs are derived from the selected master at 48, 72, 96, 144 and 192 pixels. iOS uses an opaque 1024-pixel universal app icon asset. The web favicon is a 64-pixel derivative at `app/public/branding/favicon.png`. Resizing uses Lanczos filtering; all creative artwork comes from the image generator.

Verification: Android debug and iOS simulator builds succeeded. Web typecheck, all 158 unit tests, the production build and both recap browser tests passed. These are packaging checks, not physical device acceptance.

## Immersive arena reveal

`arena.scene-asset.ts` builds an original arena with five seating tiers, an ivory floor, a speech tail and a coral play symbol. `arena-reveal.ts` animates its placement clone during onboarding: the flat mark tilts toward the seated viewer, its bowl gains depth and the play symbol rises. It settles after four seconds. Starting the match hides it immediately. It has no media commands, camera movement or audio.

The scene places it above the welcome panel in both theater and passthrough. Reduced-motion preference renders the settled shape immediately. The immersive frame subscription and session-end listener are removed on teardown. Geometry/material ownership remains with the scene manifest.

Automated evidence: reveal lifecycle, clamped frame timing, reduced motion, pose updates and cleanup have unit coverage. Managed Quest emulation confirmed the final orientation, visible onboarding arena and its removal after pointing at Start match and selecting. The model has eight meshes, 10,044 triangles and no preview geometry warnings. Physical Quest comfort and depth perception remain unverified.
