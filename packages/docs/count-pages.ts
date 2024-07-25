import { readFileSync } from "fs";
import path from "path";
import { readDir } from "./get-pages.mjs";

const root = path.join(process.cwd(), "docs");

const pages = readDir(root);

let words = 0;

for (const page of pages) {
  const contents = readFileSync(page);
  const wordCount = contents
    .toString()
    .split("\n")
    .map((s) => s.split(" "))
    .flat(1)
    .filter(Boolean).length;
  words += wordCount;
}

console.log(`There are ${pages.length} documentation pages. Words: ${words}`);
