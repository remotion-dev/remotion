import { build } from "bun";
import path from "path";
import { filteredFonts } from "./scripts/filtered-fonts";
import { removeWhitespace } from "./scripts/utils";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { $ } from "bun";
import { equal } from "assert";

const output = await build({
  entrypoints: filteredFonts.map((p) => `src/${removeWhitespace(p.family)}.ts`),
  external: [
    "remotion",
    "remotion/no-react",
    "react",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
  ],
  naming: "[name].mjs",
});

for (const file of output.outputs) {
  const str = await file.text();
  const newStr = str
    .replace(/jsxDEV/g, "jsx")
    .replace(/react\/jsx-dev-runtime/g, "react/jsx-runtime")
    .replace(/import\(\"(.*)\"\)/g, 'import("$1.mjs")');

  if (newStr.includes(`import("./ABeeZee")`)) {
    throw new Error("not compiled correctly");
  }

  Bun.write(path.join("dist", "esm", file.path), newStr);
}

// Bun does not yet support * external on Windows,
// so manually making a transpilation

const entry = path.join("src", "index.ts");
const contents = readFileSync(entry, "utf-8");
const startMark = contents.indexOf("export const getAvailable");
if (startMark === -1) {
  throw new Error("Could not find start mark");
}

const start = contents.substring(startMark);

const withoutTypes = start.replace(/\sas\sPromise\<GoogleFont\>/g, "");

const withExtension = withoutTypes
  .split("\n")
  .map((t) => {
    if (!t.includes("import(")) {
      return t;
    }

    return t.replace(/import\(\'(.*)\'\)/g, "import('$1.mjs')");
  })
  .join("\n");

const folder = path.join(process.cwd(), "dist", "esm");
if (!existsSync(folder)) {
  mkdirSync(folder, { recursive: true });
}

writeFileSync(path.join(folder, "index.mjs"), withExtension);

// We manually transpiled the script by removing TypeScript types

// Use Node.js because it does not support TypeScript
// and the goal of this script is to get rid of the TypeScript types
const length =
  await $`node --input-type=module -e "import {getAvailableFonts} from './dist/esm/index.mjs'; console.log(getAvailableFonts().length)"`
    .env({
      NO_COLOR: "1",
    })
    .text();

equal(length.trim(), "1575");
