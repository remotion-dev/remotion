// Copies the official Remotion Elements gallery (packages/docs/elements,
// the source of https://www.remotion.dev/elements/) into .claude/elements
// as a local reference library, plus a generated CATALOG.md index. Elements
// are already designed to be copied into a project and edited directly
// (see /elements/contributing) -- this just avoids re-fetching remotion.dev
// each time one is wanted.
//
// Usage: node scripts/vendor-elements.mjs [path-to-elements-source]
// Default source is the monorepo's packages/docs/elements.

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(
  process.argv[2] ?? join(projectRoot, "..", "packages", "docs", "elements"),
);
const target = join(projectRoot, ".claude", "elements");

if (!existsSync(join(source, "index.mdx"))) {
  console.error(`No Remotion Elements found at ${source}`);
  process.exit(1);
}

const parseFrontmatter = (mdx) => {
  const match = mdx.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fields = {};
  for (const line of match[1].split("\n")) {
    const fieldMatch = line.match(/^(\w+):\s*(.*)$/);
    if (fieldMatch) fields[fieldMatch[1]] = fieldMatch[2].trim();
  }
  return fields;
};

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

const categories = readdirSync(source, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

const catalog = [];

for (const category of categories) {
  const categoryDir = join(source, category);
  const slugs = readdirSync(categoryDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  for (const slug of slugs) {
    const elementDir = join(categoryDir, slug);
    const entries = readdirSync(elementDir, { withFileTypes: true }).filter(
      (e) => e.isFile(),
    );
    const mdxEntry = entries.find((e) => e.name === "index.mdx");
    const { title, description } = mdxEntry
      ? parseFrontmatter(readFileSync(join(elementDir, mdxEntry.name), "utf8"))
      : {};

    const destDir = join(target, category, slug);
    mkdirSync(destDir, { recursive: true });
    for (const entry of entries) {
      if (entry.name === "index.mdx") continue;
      cpSync(join(elementDir, entry.name), join(destDir, entry.name));
    }

    catalog.push({ category, slug, title: title ?? slug, description: description ?? "" });
  }
}

const catalogMd = [
  "# Remotion Elements — local reference library",
  "",
  "Drop-in, remixable video building blocks, vendored from this monorepo's `packages/docs/elements`",
  "(the source of https://www.remotion.dev/elements/). Each is a small, self-contained component",
  "designed to be copied into a scene and edited directly, not installed as a dependency.",
  "",
  "Copy the `.tsx` file (and `initial-props.ts` if present) from a category/slug folder below into",
  "`src/showcase/` (or wherever), then import and use its exported component. Check the file's own",
  "imports for any packages to install first.",
  "",
  ...categories.flatMap((category) => {
    const items = catalog.filter((c) => c.category === category);
    return [
      `## ${category}`,
      "",
      ...items.map(
        (c) =>
          `- **${c.title}** (\`${c.category}/${c.slug}\`)${c.description ? ` — ${c.description}` : ""}`,
      ),
      "",
    ];
  }),
].join("\n");

writeFileSync(join(target, "CATALOG.md"), catalogMd);

console.log(
  `Vendored ${catalog.length} Elements across ${categories.length} categories into .claude/elements.`,
);
