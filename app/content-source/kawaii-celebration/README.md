# Kawaii celebration runtime derivative

18 October 2026. Original derivative of [Astra's v3 sculpture](../kawaii-player-v3/README.md)
for the user's requested optional goal-celebration prototype. The original v1/v2/v3
folders are preserved. The source rebuilds v3 geometry, gives the player two standing
feet and independent rounded sleeves/cuffs/hands, then reduces dense meshes.

- `build.py` reproduces the model from the original v3 `forms.py` and `sculpt.py`.
- `kawaii-celebration.blend` retains editable geometry, named shoulder/head pivots and the packed unchanged concept.
- [Runtime GLB](../../public/models/celebration/kawaii-player.glb) contains only the player: 24,470 triangles, 42 meshes and nine material families. No ball, pitch, plinth or studio is included.
- `validation.json` records finite/nonzero geometry, the triangle budget and fresh GLB import with articulation pivots.
- `material.png`, `clay.png` and `panel.png` are IWSDK authoring previews. Live celebration captures contain private footage and remain ignored.

Rebuild from the repository root:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python-exit-code 1 --python app/content-source/kawaii-celebration/build.py
```

Blender uses Z up and -Y front; the exported root converts to glTF Y up and +Z front.
The exporter bakes that conversion into child transforms, so the runtime raises arms
around their local Z axes. Regression tests measure actual GLB hand heights. No
skeletal skinning or finished locomotion/animation library is claimed.
Closed surfaces use front-face culling. The authored contact plane is approximately
z = -0.0005 m. Runtime scaling and placement are scene-owned.

The [feature guide](../../src/features/match-moments/README.md) owns use and test commands.
Actual managed-emulator controller input is separate from physical Quest acceptance.
