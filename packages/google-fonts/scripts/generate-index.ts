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

  // Generate file for package.json
  const packageFilename = `package.json`;
  const read = JSON.parse(await fs.promises.readFile(packageFilename, "utf-8"));
  for (const font of googleFonts) {
    if (!read.typesVersions) read.typesVersions = {};
    if (!read.typesVersions[">=1.0"]) read.typesVersions[">=1.0"] = {};
    read.typesVersions[">=1.0"][removeWhitespace(unqoute(font.family))] = [
      `dist/${removeWhitespace(unqoute(font.family))}.d.ts`,
    ];
    if (!read.exports) read.exports = {};
    read.exports[
      `./${removeWhitespace(unqoute(font.family))}`
    ] = `dist/${removeWhitespace(unqoute(font.family))}.js`;
  }

  await fs.promises.writeFile(packageFilename, JSON.stringify(read, null, 2));
};

generate();
