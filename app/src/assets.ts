import { minimalScreen } from "./features/tabletop-reveal/table.scene-asset";
import { AssetType, defineAssets } from "@iwsdk/core";
import {
  celebrationLeftHand,
  celebrationRightHand,
} from "./scene-assets/celebration-hand.scene-asset";
import {
  windowGrip,
  windowMove,
  windowResize,
  windowResizeGrip,
  momentCard,
} from "./features/spatial-windows/objects.scene-asset";
import { assetUrl } from "./features/content/model";
import pregameArt from "./features/recap/artwork/res/drawable-nodpi/playmaker_football.png";
export default defineAssets({
  celebrationLeftHand,
  celebrationRightHand,
  "kawaii-celebration": {
    url: assetUrl("models/celebration/kawaii-player.glb"),
    type: AssetType.GLTF,
  },
  minimalScreen,
  "lab-art-pregame": { url: pregameArt, type: AssetType.Texture },
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
  windowGrip,
  windowMove,
  windowResize,
  windowResizeGrip,
  momentCard,
  ...Object.fromEntries(
    ["minimal-dock", "moment-actions", "moment-notice", "goal-celebration"].map(
      (id) => [
        id,
        {
          url: assetUrl(`ui/${id}.uikitml`),
          type: AssetType.UIKitML,
          name: id,
        },
      ],
    ),
  ),
});
