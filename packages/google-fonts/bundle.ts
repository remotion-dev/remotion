const presentations = ["slide", "flip", "wipe", "fade", "clock-wipe"];
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
    "@remotion/paths",
    "@remotion/shapes",
    "*",
  ],
  naming: "[name].mjs",
});

for (const file of output.outputs) {
  const str = await file.text();
  const newStr = str
    .replace(/jsxDEV/g, "jsx")
    .replace(/react\/jsx-dev-runtime/g, "react/jsx-runtime");

  const cjsExport = newStr
    .replace(
      `import {continueRender, delayRender} from "remotion";`,
      `const {continueRender, delayRender} = require("remotion");`
    )
    .replace(
      `
export {
  loadFont,
  getInfo,
  fontFamily
};
  `.trim(),
      `
exports.fontFamily = fontFamily;
exports.getInfo = getInfo;
exports.loadFont = loadFont;
  `.trim()
    )
    .replace(
      `import {loadFonts} from "./base";`.trim(),
      `const {loadFonts} = require("./base");`.trim()
    )
    .replace(
      `
export {
  getAvailableFonts
};
    `.trim(),
      `
exports.getAvailableFonts = getAvailableFonts;
    `.trim()
    )
    .replace(
      `
export {
  loadFonts
};
    `.trim(),
      `
exports.loadFonts = loadFonts;
    `.trim()
    );

  if (cjsExport.includes("\nexport ")) {
    console.log(cjsExport);
    throw new Error("Unexpected export");
  }
  if (cjsExport.includes("\nimport")) {
    throw new Error("Unexpected export");
  }
  Bun.write(path.join("dist", "esm", file.path), newStr);
  Bun.write(
    path.join("dist", "cjs", file.path.replace(".mjs", ".cjs")),
    cjsExport
  );
}
