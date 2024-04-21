// TODO: Not yet used, waiting for Windows support
// https://github.com/oven-sh/bun/issues/9974
import { build } from "bun";
import path from "path";
import { filteredFonts } from "./scripts/filtered-fonts";
import { removeWhitespace } from "./scripts/utils";

const output = await build({
  entrypoints: [
    "src/index.ts",
    "src/base.ts",
    ...filteredFonts.map((p) => `src/${removeWhitespace(p.family)}.ts`),
  ],
  external: [
    "remotion",
    "remotion/no-react",
    "react",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
    "*",
  ],
  naming: "[name].mjs",
});

for (const file of output.outputs) {
  const str = await file.text();
  const newStr = str
    .replace(/jsxDEV/g, "jsx")
    .replace(/react\/jsx-dev-runtime/g, "react/jsx-runtime")
    .replace(/import\(\"(.*)\"\)/g, 'import("$1.mjs")')
    .replace(
      `import {loadFonts} from "./base";`,
      `import {loadFonts} from "./base.mjs";`
    );

  if (newStr.includes(`import("./ABeeZee")`)) {
    throw new Error("not compiled correctly");
  }

  Bun.write(path.join("dist", "esm", file.path), newStr);
}
