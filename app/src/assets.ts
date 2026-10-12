import { AssetType, defineAssets } from "@iwsdk/core";
import surfaces from "./features/xr/surfaces.scene-asset";
import theater from "./scene-assets/theater.scene-asset";
import { assetUrl } from "./features/content/model";
export default defineAssets({
  surfaces,
  theater,
  ...Object.fromEntries(
    [
      "watch-controls",
      "learning",
      "explore",
      "welcome",
      "karaoke",
      "coach",
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
