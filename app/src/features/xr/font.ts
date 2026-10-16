import { TTFLoader } from "@pmndrs/uikit";
import { assetUrl } from "../content/model";
// UIKit's default TTF charset omits Spanish accents. Include all Spanish
// letters and the punctuation used by dynamic copy.
export const SPATIAL_CHARSET =
  Array.from({ length: 95 }, (_, i) => String.fromCharCode(i + 32)).join("") +
  "áéíóúüñÁÉÍÓÚÜÑ¿¡·…–";
export async function loadCompanionFont() {
  const families = await new TTFLoader().loadAsync([
    {
      url: assetUrl("fonts/AtkinsonHyperlegible-Regular.ttf"),
      charset: SPATIAL_CHARSET,
      textureSize: [1024, 1024],
    },
  ]);
  const family = Object.values(families)[0];
  const font = Object.values(family)[0];
  return { Atkinson: { "400": font, normal: font } };
}

/** Canvas cards use a bundled serif; no dependency on the headset's system fonts. */
export async function loadCardTypeface() {
  const face = new FontFace("ArenaCard", `url(${assetUrl("fonts/LibreBaskerville.ttf")})`, { weight: "400 700" });
  document.fonts.add(await face.load());
}
