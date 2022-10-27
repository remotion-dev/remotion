import fs from "node:fs";
import path from "path";
import axios from "axios";
import postcss from "postcss";
import prettier from "prettier";
import PQueue from "p-queue";

import { getCssLink, unqoute, quote } from "./utils.mjs";

const OUTDIR = "./src";
const FONTDATA_FILE = "./google-fonts.json";

const generate = async () => {
  const fonts = JSON.parse(fs.readFileSync(FONTDATA_FILE, "utf-8"));
  // Prepare filename
  const filename = `index.ts`;

  console.log(`- Generating ${filename}`);
  let output = `export const availableFonts = ${JSON.stringify(
    fonts.items.map((f) => ({
      fontFamily: f.family.replace(/^['"]/g, "").replace(/['"]$/g, ""),
      importName: f.family
        .replace(/^['"]/g, "")
        .replace(/['"]$/g, "")
        .replace(/\s/g, ""),
    })),
    null,
    2
  )};`;

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

generate();
