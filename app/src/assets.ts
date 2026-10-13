import { AssetType, defineAssets } from "@iwsdk/core";
import surfaces from "./features/xr/surfaces.scene-asset";
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
  surfaces,
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
