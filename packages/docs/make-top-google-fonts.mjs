import { getAvailableFonts } from "@remotion/google-fonts";
import sortBy from "lodash.sortby";
import prettier from "prettier";

const amount = Number(process.argv[2]);

const res = await fetch("https://fonts.google.com/metadata/stats");
const json = await res.text();

const bypassCors = json.substring(4).trim();
const allFonts = JSON.parse(bypassCors);

const sorted = sortBy(allFonts, (f) => 0 - f.viewsByDateRange["7day"].views);

const topFonts = sortBy(
  sorted
    .filter((s) => {
      return (
        s.family !== "Material Icons" &&
        s.family !== "Material Icons Outlined" &&
        s.family !== "Material Icons Round" &&
        s.family !== "Material Icons Sharp" &&
        s.family !== "Material Symbols Outlined" &&
        s.family !== "Material Symbols Rounded" &&
        s.family !== "Material Icons Two Tone"
      );
    })
    .slice(0, amount),
  (s) => s.family,
);

const availableFonts = getAvailableFonts();
const remotionList = topFonts.map((t) => {
  const { importName } = availableFonts.find((f) => f.fontFamily === t.family);
  return `{family: "${t.family}", load: () => import("@remotion/google-fonts/${importName}") as Promise<GoogleFont>},`;
});
const js = `import type {GoogleFont} from '@remotion/google-fonts';\n\nexport const top${amount} = [${remotionList.join(
  "",
)}]`;
const prettified = await prettier.format(js, {
  parser: "typescript",
  singleQuote: true,
  quoteProps: "consistent",
  printWidth: 80,
});

console.log(prettified);
