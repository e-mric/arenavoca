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
} from "./features/spatial-windows/objects.scene-asset";
import theater from "./scene-assets/theater.scene-asset";
import arena from "./features/branding/arena.scene-asset";
import { assetUrl } from "./features/content/model";
import {
  labBoard,
  labPawn,
  labBall,
  labReplay,
} from "./features/match-lab/lab.scene-asset";
export default defineAssets({
  labBoard,
  labPawn,
  labBall,
  labReplay,
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
