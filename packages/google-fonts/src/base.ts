import type {} from "css-font-loading-module";
import { continueRender, delayRender } from "remotion";

const loadedFonts: { [key: string]: boolean } = {};

export const loadFonts = (
  meta: any,
  style: string,
  options: {
    weights: string[];
    subsets: string[];
  }
) => {
  for (const weight of options.weights) {
    for (const subset of options.subsets) {
      //  Get font url from meta
      let font = meta.fonts[style]?.[weight]?.[subset];

      //  Check is font available in meta
      if (!font) {
        throw new Error(
          `weight: ${weight} subset: ${subset} is not available for '${meta.family}'`
        );
      }

      //  Check is font already loaded
      let fontKey = `${meta.family}-${style}-${weight}-${subset}`;
      if (loadedFonts[fontKey]) {
        continue;
      }

      //  Mark font as loaded
      loadedFonts[fontKey] = true;

      const handle = delayRender(
        `Fetching ${meta.family} font ${JSON.stringify({
          style,
          weight,
          subset,
        })}`
      );

      //  Create font-face
      const fontFace = new FontFace(
        meta.family.replace(/^['"]/g, "").replace(/['"]$/g, ""),
        `url(${font}) format('woff2')`,
        {
          weight: weight,
          style: style,
          unicodeRange: meta.unicodeRanges[subset],
        }
      );

      //  Load font-face
      fontFace
        .load()
        .then(() => {
          document.fonts.add(fontFace);
          continueRender(handle);
        })
        .catch((err) => {
          //  Mark font as not loaded
          loadedFonts[fontKey] = false;
          throw err;
        });
    }
  }
};
