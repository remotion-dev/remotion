import fs from "fs";
import path from "path";
import { readDir } from "./get-pages.mjs";

const root = path.join(process.cwd(), "docs");

const pages = readDir(root);

const findId = (split, page) => {
  const found = split.find((s) => s.startsWith("id: "));
  if (found) {
    return found.substr("id: ".length);
  }

  return page
    .replace(process.cwd() + path.sep + "docs" + path.sep, "")
    .replace(/.md$/, "");
};

const findTitle = (split) => {
  const title = split
    .find((s) => s.startsWith("title: "))
    .replace(/^title:\s/, "");
  if (title.startsWith('"')) {
    return title.substr(1, title.length - 2);
  }

  return title;
};

const findCrumb = (split) => {
  const crumb = split
    .find((s) => s.startsWith("crumb: "))
    ?.replace(/^crumb:\s/, "");
  if (crumb?.startsWith('"')) {
    return crumb.substr(1, crumb.length - 2);
  }

  return crumb ?? null;
};

const data = [];

for (const page of pages) {
  const opened = fs.readFileSync(page, "utf8");
  const frontmatter = opened.match(/---\n((.|\n)*?)---\n/);
  if (!frontmatter) {
    continue;
  }

  const split = frontmatter[1].split("\n");
  const id = findId(split, page);
  const title = findTitle(split);
  const crumb = findCrumb(split);

  const relativePath = page.replace(process.cwd() + path.sep, "");
  const compId = relativePath.replace(/\//g, "-").replace(/.md$/, "");
  data.push({ id, title, relativePath, compId, crumb });
}

fs.writeFileSync(
  path.join(process.cwd(), "src", "data", "articles.ts"),
  `export const articles = ` + JSON.stringify(data, null, 2)
);
