# Original tabletop assets

Authored for ArenaVoca on 16 October 2026 using Drawcall GLTS. These are original procedural models, not marketplace assets or AI-generated meshes. The signed-in generation request returned HTTP 403, `A generate entitlement is required`; no generated asset was received and no private match media was uploaded. Drawcall Design was not available in the installed CLI.

- `player.glts`: one anonymous player design, reused for two teammates; runtime-selected football shirt/trim without club logos. Metres, +Y up, +Z forward, origin at the soles. Height approximately 0.163 m; oversized head, mitten hands and short boots are intentionally toy-like. The exported file retains named jersey, sleeve and trim meshes for kit changes. Named limb groups remain editable (GLB names use underscores).
- `pitch.glts`: original lavender tabletop with cream markings and one coral attacking goal, matching the mobile Playmaker palette. Metres, +Y up, attack +X, playing surface y=0. Board 1.24 × 0.80 m; rear goal net reaches x=0.65 m. This is authored teaching scenery, not a tracked reconstruction of Alba's play.
- Outputs: `app/public/models/match-lab/player.glb` and `pitch.glb`. The app loads static GLB through its IWSDK manifest; it does not execute GLTS or install a second renderer/physics engine.

Re-export from `app/` using Node 22.18+ or 24.11+. Trial used `@drawcall/glts@0.20.0` through the Drawcall launcher:

```sh
npx drawcall glts export content-source/drawcall/player.glts -o public/models/match-lab/player.glb
npx drawcall glts export content-source/drawcall/pitch.glts -o public/models/match-lab/pitch.glb
```

Keep both original source and GLB outputs in Git. Future tool versions may alter exports; review the output in the IWSDK asset preview before replacing the runtime assets. The shared coral ball-selection ring is authored in `src/features/match-lab/lab.scene-asset.ts`.
