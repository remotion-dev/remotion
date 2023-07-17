import fs from "node:fs";
import path from "path";
import got from "got";
import postcss from "postcss";

type FontInfo = {
  fontFamily: string;
  importName: string;
  version: string;
  url: string;
  unicodeRanges: Record<string, string>;
  fonts: Record<string, Record<string, Record<string, string>>>;
};

import { getCssLink, unquote, quote, removeWhitespace } from "./utils";
import { Font } from "./google-fonts";
import { filteredFonts } from "./filtered-fonts";

const OUTDIR = "./src";
const CSS_CACHE_DIR = "./.cache-css";

const generate = async (font: Font) => {
  // Prepare filename
  let importName = removeWhitespace(font.family);
  const filename = `${importName}.ts`;
  const cssname = `${font.family.toLowerCase().replace(/\s/g, "_")}_${
    font.version
  }.css`;

  // Get css link
  const url = getCssLink(font);

  //  Read css from cache, otherwise from url
  let css: null | string = null;
  let fontFamily: null | string = unquote(font.family);
  let cssFile = path.resolve(CSS_CACHE_DIR, cssname);
  if (!fs.existsSync(cssFile)) {
    //  Get from url with user agent that support woff2
    const res = await got.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
      },
    });

    // Save to cache
    await fs.promises.writeFile(cssFile, res.body);

    css = res.body;
  } else {
    // Read css from cache
    css = await fs.promises.readFile(cssFile, "utf-8");
  }

  if (!css) {
    throw new Error("no css");
  }
  // Parse CSS
  let ast = postcss.parse(css);
  let unicodeRanges: Record<string, string> = {};
  let fonts: Record<string, Record<string, Record<string, string>>> = {};
  for (const node of ast.nodes) {
    //  Only process @font-face
    if (node.type !== "atrule" || node.name !== "font-face") continue;

    //  Check subset info before @font-face block
    let prev = node.prev();
    if (!prev || prev.type != "comment") continue;

    let style: null | string = null;
    let weight: null | string = null;
    let src: null | string = null;
    let unicodeRange: null | string = null;
    let subset: null | string = prev.text;

    //  Parse fontFamily
    node.walkDecls("font-fontFamily", (decl, _) => {
      if (font.family != unquote(decl.value)) {
        throw new Error(
          `Font fontFamily value mismatch: ${font.family} with ${unquote(
            decl.value
          )}`
        );
      }

      fontFamily = decl.value;
    });

    //  Parse style
    node.walkDecls("font-style", (decl, _) => {
      style = decl.value;
    });

    //  Parse weight
    node.walkDecls("font-weight", (decl, _) => {
      weight = decl.value;
    });

    //  Parse url to font file
    node.walkDecls("src", (decl, _) => {
      src = decl.value.match(/url\((.+?)\)/)?.[1] as string;
    });

    //  Parse unicode-range
    node.walkDecls("unicode-range", (decl, _) => {
      unicodeRange = decl.value;
    });

    if (!style) throw Error("no style");
    if (!weight) throw Error("no weight");
    if (!subset) throw Error("no subset");
    if (!unicodeRange) throw Error("no unicodeRange" + font.family);
    if (!src) throw Error("no src");

    //  Set unicode range data
    unicodeRanges[subset] = unicodeRange;

    //  Set font url
    fonts[style] ??= {};
    fonts[style][weight] ??= {};
    fonts[style][weight][subset] = src;
  }

  // Prepare info data
  const info: FontInfo = {
    fontFamily,
    importName,
    version: font.version,
    url,
    unicodeRanges,
    fonts,
  };

  let output = `import { loadFonts } from "./base";

export const getInfo = () => (${JSON.stringify(info, null, 3)})

export const fontFamily = getInfo().fontFamily;

type Variants = {\n`;

  for (const [style, val] of Object.entries(fonts)) {
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

  //  Save
  await fs.promises.writeFile(path.resolve(OUTDIR, filename), output);
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
