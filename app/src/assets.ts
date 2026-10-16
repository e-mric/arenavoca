import { teamStadium, teamCelebration } from "./features/match-lab/atmosphere.scene-asset";
import { AssetType, defineAssets } from "@iwsdk/core";
import {
  matchScreen,
  matchFrame,
  passDiagram,
  traceDiagram,
} from "./features/xr/surfaces.scene-asset";
import {
  windowGrip,
  windowMove,
  windowResize,
  momentCard,
  practiceCard,
} from "./features/spatial-windows/objects.scene-asset";
import theater from "./scene-assets/theater.scene-asset";
import arena from "./features/branding/arena.scene-asset";
import { assetUrl } from "./features/content/model";
import {
  labBoard,
  labPawn,
  labBall,
  labReplay,
  tabletopBallRing,
  tabletopAim,
} from "./features/match-lab/lab.scene-asset";
export default defineAssets({
  teamStadium,
  teamCelebration,
  tabletopPlayer: {
    url: assetUrl("models/match-lab/player.glb?v=playmaker-3"),
    type: AssetType.GLTF,
  },
  tabletopPitch: {
    url: assetUrl("models/match-lab/pitch.glb?v=playmaker-3"),
    type: AssetType.GLTF,
  },
  labBoard,
  labPawn,
  labBall,
  labReplay,
  tabletopBallRing,
  tabletopAim,
  "lab-art-draft": {
    url: assetUrl("branding/favicon.png"),
    type: AssetType.Texture,
  },
  ...Object.fromEntries(
    [
      "bale-run",
      "bale-cross",
      "benzema-volley",
      "alba-run",
      "alba-cutback",
      "coutinho-goal",
    ].map((id) => [
      `lab-art-${id}`,
      { url: assetUrl(`artwork/match-lab/${id}.png`), type: AssetType.Texture },
    ]),
  ),
  matchScreen,
  matchFrame,
  passDiagram,
  traceDiagram,
  windowGrip,
  windowMove,
  windowResize,
  momentCard,
  practiceCard,
  theater,
  arena,
  ...Object.fromEntries(
    [
      "watch-controls",
      "learning",
      "explore",
      "welcome",
      "karaoke",
      "coach",
      "match-lab",
      "tabletop-lesson",
    ].map((id) => [
      id,
      {
        url: assetUrl(`ui/${id}.uikitml`),
        type: AssetType.UIKitML,
        name: id,
      },
    ]),
  ),
});
