import type {} from "css-font-loading-module";
import { continueRender, delayRender } from "remotion";

const loadedFonts: { [key: string]: boolean } = {};
export type FontInfo = {
  fontFamily: string;
  importName: string;
  version: string;
  url: string;
  unicodeRanges: Record<string, string>;
  fonts: Record<string, Record<string, Record<string, string>>>;
};

/**
 * @description Load a Google Font for use in Remotion.
 * @param meta 
 * @param {string} style The font style we want to load. While each font has a different set of styles, common options are: normal, italic etc. 
 * @param {Array} options 
 * @returns An object with the following properties: fontFamily, unicodeRanges, fonts
 * @see [Documentation](https://www.remotion.dev/docs/google-fonts/load-font)
 */
export const loadFonts = (
  meta: FontInfo,
  style?: string,
  options?: {
    weights?: string[];
    subsets?: string[];
    document?: Document;
  }
): {
  fontFamily: FontInfo["fontFamily"];
  fonts: FontInfo["fonts"];
  unicodeRanges: FontInfo["unicodeRanges"];
} => {
  const styles = style ? [style] : Object.keys(meta.fonts);
  for (const style of styles) {
    // Don't load fonts on server
    if (typeof FontFace === "undefined") {
      continue;
    }

    if (!meta.fonts[style]) {
      throw new Error(
        `The font ${meta.fontFamily} does not have a style ${style}`
      );
    }
    const weights = options?.weights ?? Object.keys(meta.fonts[style]);
    for (const weight of weights) {
      if (!meta.fonts[style][weight]) {
        throw new Error(
          `The font ${meta.fontFamily} does not have a weight ${weight} in style ${style}`
        );
      }
      const subsets =
        options?.subsets ?? Object.keys(meta.fonts[style][weight]);
      for (const subset of subsets) {
        //  Get font url from meta
        let font = meta.fonts[style]?.[weight]?.[subset];

        //  Check is font available in meta
        if (!font) {
          throw new Error(
            `weight: ${weight} subset: ${subset} is not available for '${meta.fontFamily}'`
          );
        }

        //  Check is font already loaded
        let fontKey = `${meta.fontFamily}-${style}-${weight}-${subset}`;
        if (loadedFonts[fontKey]) {
          continue;
        }

        //  Mark font as loaded
        loadedFonts[fontKey] = true;

        const handle = delayRender(
          `Fetching ${meta.fontFamily} font ${JSON.stringify({
            style,
            weight,
            subset,
          })}`
        );

        //  Create font-face
        const fontFace = new FontFace(
          meta.fontFamily,
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
  }

  return {
    fontFamily: meta.fontFamily,
    fonts: meta.fonts,
    unicodeRanges: meta.unicodeRanges,
  };
};
