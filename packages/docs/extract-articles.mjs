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
  const compId =
    "articles-" + relativePath.replace(/\//g, "-").replace(/.md$/, "");
  data.push({ id, title, relativePath, compId, crumb });
}

fs.writeFileSync(
  path.join(process.cwd(), "src", "data", "articles.ts"),
  `export const articles = ` + JSON.stringify(data, null, 2)
);

import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill } from "@remotion/renderer";

const serveUrl = await bundle({
  entryPoint: path.join(process.cwd(), "./src/remotion/entry.ts"),
  publicDir: path.join(process.cwd(), "static"),
});
const compositions = await getCompositions(serveUrl);

for (const entry of data.slice(0, 5)) {
  const composition = compositions.find((c) => c.id === entry.compId);
  await renderStill({
    composition,
    output: `static/generated/${composition.id}.png`,
    serveUrl,
  });

  const fileContents = fs.readFileSync(
    path.join(process.cwd(), entry.relativePath),
    "utf-8"
  );
  const lines = fileContents.split("\n");
  const frontmatterLine = lines.findIndex((l) => l === "---");
  if (frontmatterLine === -1) {
    throw new Error("could not find frontmatter for " + composition.id);
  }

  const newLines = [
    ...lines.slice(0, frontmatterLine),
    ...lines.slice(frontmatterLine),
  ];

  console.log("Rendered", composition.id);
}
