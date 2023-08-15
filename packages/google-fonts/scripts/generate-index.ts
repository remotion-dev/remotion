import fs from "node:fs";
import path from "path";
import prettier from "prettier";
import { removeWhitespace, unquote } from "./utils";
import { filteredFonts } from "./filtered-fonts";

const OUTDIR = "./src";

const generate = async () => {
  // Prepare filename
  const filename = `index.ts`;

  console.log(`- Generating ${filename}`);
  let output = `export const getAvailableFonts = () => ${JSON.stringify(
    filteredFonts.map((f) => {
      const importName = removeWhitespace(unquote(f.family));
      return {
        fontFamily: unquote(f.family),
        importName,
        load: `() => import('./${importName}')`,
      };
    })
  )};`.replace(/\"\(\)\s\=\>\s(.*?)\"/g, (e) => {
    return e.substring(1, e.length - 1);
  });

  //  Format output
  output = prettier.format(output, {
    parser: "typescript",
    singleQuote: true,
    quoteProps: "consistent",
    printWidth: 80,
  });

  //  Save
  await fs.promises.writeFile(path.resolve(OUTDIR, filename), output);
  console.log(`- ${filename} generated`);

  // Generate file for package.json
  const packageFilename = `package.json`;
  const read = JSON.parse(await fs.promises.readFile(packageFilename, "utf-8"));
  for (const font of filteredFonts) {
    if (!read.typesVersions) read.typesVersions = {};
    if (!read.typesVersions[">=1.0"]) read.typesVersions[">=1.0"] = {};
    read.typesVersions[">=1.0"][removeWhitespace(unquote(font.family))] = [
      `dist/esm/${removeWhitespace(unquote(font.family))}.d.ts`,
    ];
  }

  await fs.promises.writeFile(
    packageFilename,
    JSON.stringify(read, null, 2) + "\n"
  );
};

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
