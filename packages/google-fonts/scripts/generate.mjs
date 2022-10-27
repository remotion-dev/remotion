import fs from "node:fs";
import path from "path";
import axios from "axios";
import postcss from "postcss";
import prettier from "prettier";
import PQueue from "p-queue";

import { getCssLink, unqoute, quote } from "./utils.mjs";

const OUTDIR = "./src";
const CSS_CACHE_DIR = "./.cache-css";
const FONTDATA_FILE = "./google-fonts.json";

const generate = async (font) => {
  // Prepare meta data
  let meta = {
    family: font.family,
    version: font.version,
    url: null,
    unicodeRanges: {},
    fonts: {},
  };

  // Prepare filename
  const filename = `${font.family.replace(/\s/g, "")}.ts`;
  const cssname = `${font.family.toLowerCase().replace(/\s/g, "_")}_${
    font.version
  }.css`;

  // Get css link
  meta.url = getCssLink(font);

  //  Read css from cache, otherwise from url
  let css,
    cssFile = path.resolve(CSS_CACHE_DIR, cssname);
  if (!fs.existsSync(cssFile)) {
    //  Get from url with user agent that support woff2
    let res = await axios.get(meta.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
      },
    });

    // Save to cache
    await fs.promises.writeFile(cssFile, res.data);

    css = res.data;
  } else {
    // Read css from cache
    css = await fs.promises.readFile(cssFile);
  }

  // Parse CSS
  let ast = postcss.parse(css);
  for (const node of ast.nodes) {
    //  Only process @font-face
    if (node.type != "atrule" && node.name != "font-face") continue;

    //  Check subset info before @font-face block
    let prev = node.prev();
    if (prev.type != "comment") continue;

    let style,
      weight,
      src,
      unicodeRange,
      subset = prev.text;

    //  Parse family
    node.walkDecls("font-family", (decl, _) => {
      if (font.family != unqoute(decl.value)) {
        throw new Error(
          `Font Family value mismatch: ${font.family} with ${unqoute(
            decl.value
          )}`
        );
      }

      meta.family = decl.value;
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
      src = decl.value.match(/url\((.+?)\)/)?.[1];
    });

    //  Parse unicode-range
    node.walkDecls("unicode-range", (decl, _) => {
      unicodeRange = decl.value;
    });

    //  Set unicode range data
    meta.unicodeRanges[subset] = unicodeRange;

    //  Set font url
    meta.fonts[style] ??= {};
    meta.fonts[style][weight] ??= {};
    meta.fonts[style][weight][subset] = src;
  }

  console.log(`- Generating ${filename}`);
  let output = `import { loadFonts } from "./base";

export const meta = ${JSON.stringify(meta, null, 3)}

export const family = meta.family;

type Variants = {\n`;

  for (const [style, val] of Object.entries(meta.fonts)) {
    output += `  ${style}: {\n`;
    output += `    weights: ${Object.keys(val).map(quote).join(" | ")},\n`;
    output += `    subsets: ${font.subsets.map(quote).join(" | ")},\n`;
    output += `  },\n`;
  }

  output += `};

export const loadFont = <T extends keyof Variants>(
  style: T,
  options: {
    weights: Variants[T]['weights'][];
    subsets: Variants[T]['subsets'][];
  }
) => { 
  loadFonts(meta, style, options);
};
`;

  //  Format output
  output = prettier.format(output, {
    parser: "typescript",
    singleQuote: true,
    quoteProps: "consistent",
    printWidth: 180,
  });

  //  Save
  await fs.promises.writeFile(path.resolve(OUTDIR, filename), output);
  console.log(`- ${filename} generated`);
};

const run = async () => {
  // Prepare css cache dir
  if (!fs.existsSync(CSS_CACHE_DIR)) {
    await fs.promises.mkdir(CSS_CACHE_DIR, { recursive: true });
  }

  // Read font list from google fonts api response
  const fontData = JSON.parse(
    await fs.promises.readFile(FONTDATA_FILE, "utf-8")
  );

  // create queue
  const queue = new PQueue({
    concurrency: 5,
  });

  // Batch convert
  for (const font of fontData.items) {
    queue.add(async () => await generate(font));
  }

  // wait queue
  await queue.onIdle();

  console.log("- All done");
};

run();
