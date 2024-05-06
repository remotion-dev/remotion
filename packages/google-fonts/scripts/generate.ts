import fs, { mkdirSync } from "node:fs";
import path from "path";

import {
  getCssLink,
  unquote,
  quote,
  removeWhitespace,
  replaceDigitsWithWords,
} from "./utils";
import { Font } from "./google-fonts";
import { filteredFonts } from "./filtered-fonts";
import { FontInfo, extractInfoFromCss } from "./extract-info-from-css";

const OUTDIR = "./src";
const CSS_CACHE_DIR = "./.cache-css";

const generate = async (font: Font) => {
  // Prepare filename
  const importName = removeWhitespace(font.family);
  const filename = `${importName}.ts`;
  const tsFile = path.resolve(OUTDIR, filename);
  const cssname = `${font.family.toLowerCase().replace(/\s/g, "_")}_${
    font.version
  }.css`;

  // Get css link
  const url = getCssLink(font);

  //  Read css from cache, otherwise from url
  let css: null | string = null;
  let fontFamily: null | string = replaceDigitsWithWords(unquote(font.family));
  let cssFile = path.resolve(CSS_CACHE_DIR, cssname);
  //  Get from url with user agent that support woff2
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
    },
  });

  // Save to cache
  const body = await res.text();
  await fs.promises.writeFile(cssFile, body);
  console.log("Generated", cssFile);

  css = body;

  if (!css) {
    throw new Error("no css");
  }

  // Prepare info data
  const info: FontInfo = extractInfoFromCss({
    contents: css,
    fontFamily: fontFamily,
    importName: importName,
    url: url,
    version: font.version,
  });

  let output = `import { loadFonts } from "./base";

export const getInfo = () => (${JSON.stringify(info, null, 3)})

export const fontFamily = "${fontFamily}" as const;

type Variants = {\n`;

  for (const [style, val] of Object.entries(info.fonts)) {
    output += `  ${style}: {\n`;
    output += `    weights: ${Object.keys(val).map(quote).join(" | ")},\n`;
    output += `    subsets: ${font.subsets.map(quote).join(" | ")},\n`;
    output += `  },\n`;
  }

  output += `};

export const loadFont = <T extends keyof Variants>(
  style?: T,
  options?: {
    weights?: Variants[T]['weights'][];
    subsets?: Variants[T]['subsets'][];
    document?: Document;
  }
) => { 
  return loadFonts(getInfo(), style, options);
};

`;

  mkdirSync(OUTDIR, { recursive: true });
  //  Save
  const existed = fs.existsSync(tsFile);
  await fs.promises.writeFile(tsFile, output);
  if (!existed) {
    console.log("Wrote", tsFile);
  }
};

const run = async () => {
  const date = Date.now();

  // Prepare css cache dir
  if (!fs.existsSync(CSS_CACHE_DIR)) {
    await fs.promises.mkdir(CSS_CACHE_DIR, { recursive: true });
  }

  // Batch convert
  for (const font of filteredFonts) {
    await generate(font);
  }

  console.log("- Generated fonts in " + (Date.now() - date) + "ms");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
