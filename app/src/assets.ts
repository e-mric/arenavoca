import { AssetType, defineAssets } from "@iwsdk/core";
import surfaces from "./features/xr/surfaces.scene-asset";
import { assetUrl } from "./features/content/model";
export default defineAssets({
  surfaces,
  ...Object.fromEntries(
    ["watch-controls", "learning", "explore", "welcome"].map((id) => [
      id,
      { url: assetUrl(`ui/${id}.uikitml`), type: AssetType.UIKitML, name: id },
    ]),
  ),
});
