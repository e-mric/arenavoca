# ArenaVoca icon

The mark combines an arena, a speech bubble and a play symbol. The shared cobalt, coral and ivory palette connects the mobile Playmaker design with the immersive Matchday experience without tying the icon to one sport.

`artwork/arenavoca-icon-master.png` is the original generated master currently used in the app. Three nearby alternatives are retained as `continuous-arena.png`, `conversation-first.png` and `compact-arena.png`. The user's final choice among these alternatives is pending. Generation prompts and method are recorded in `artwork/prompts.json`.

Android launcher PNGs are derived from the original master at 48, 72, 96, 144 and 192 pixels. iOS uses an opaque 1024-pixel universal app icon asset. The web favicon is a 64-pixel derivative at `app/public/branding/favicon.png`. Resizing uses Lanczos filtering; all creative artwork comes from the image generator.

Verification: Android debug and iOS simulator builds succeeded. Web typecheck, all 158 unit tests, the production build and both recap browser tests passed. These are packaging checks, not physical device acceptance.
