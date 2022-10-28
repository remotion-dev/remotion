import fs from "node:fs";
import path from "path";
import prettier from "prettier";
import { googleFonts } from "./google-fonts";
import { removeWhitespace, unqoute } from "./utils";

const OUTDIR = "./src";

const generate = async () => {
  // Prepare filename
  const filename = `index.ts`;

  console.log(`- Generating ${filename}`);
  let output = `export const getAvailableFonts = () => ${JSON.stringify(
    googleFonts.map((f) => ({
      fontFamily: unqoute(f.family),
      importName: removeWhitespace(unqoute(f.family)),
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
