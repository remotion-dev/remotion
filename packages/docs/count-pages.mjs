import path from "path";
import { readDir } from "./get-pages.mjs";

const root = path.join(process.cwd(), "docs");

const pages = readDir(root);

console.log(`There are ${pages.length} documentation pages.`);
