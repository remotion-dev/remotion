// Copies the official Remotion agent skills into .claude/skills as a
// symlink-free tree, so the folder works on Windows checkouts and can be
// zipped for upload to claude.ai without duplicated content.
//
// Usage: node scripts/vendor-skills.mjs [path-to-skills-source]
// Default source is the monorepo's packages/skills/skills.

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(
  process.argv[2] ?? join(projectRoot, "..", "packages", "skills", "skills"),
);
const target = join(projectRoot, ".claude", "skills");

if (!existsSync(join(source, "remotion-best-practices", "SKILL.md"))) {
  console.error(`No Remotion skills found at ${source}`);
  process.exit(1);
}

const copyWithoutSymlinks = (src, dst) => {
  mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const from = join(src, entry.name);
    const to = join(dst, entry.name);
    if (entry.isDirectory()) copyWithoutSymlinks(from, to);
    else cpSync(from, to);
  }
};

rmSync(target, { recursive: true, force: true });
copyWithoutSymlinks(source, target);

const skillNames = new Set(
  readdirSync(target, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name),
);

const markdownFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return markdownFiles(full);
    return entry.name.endsWith(".md") ? [full] : [];
  });

// Upstream skills link to sibling skills through symlinks named after the
// skill (e.g. remotion-best-practices/remotion-create -> ../remotion-create).
// Without the symlinks, point those links at the real sibling directory.
const linkPattern =
  /\]\((?:\.\/)?(remotion-[a-z0-9-]+)\/([^)#\s]*)(#[^)\s]*)?\)/g;
let rewritten = 0;
const broken = [];

for (const file of markdownFiles(target)) {
  const fileDir = dirname(file);
  const original = readFileSync(file, "utf8");
  const updated = original.replace(
    linkPattern,
    (match, skill, rest, hash = "") => {
      if (!skillNames.has(skill) || existsSync(join(fileDir, skill))) {
        return match;
      }
      const toSibling = relative(fileDir, join(target, skill))
        .split(sep)
        .join("/");
      rewritten++;
      return `](${toSibling}/${rest}${hash})`;
    },
  );
  if (updated !== original) writeFileSync(file, updated);

  for (const [, link] of updated.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(link)) continue;
    const path = link.split("#")[0];
    if (path && !existsSync(resolve(fileDir, path))) {
      broken.push(`${relative(projectRoot, file)} -> ${link}`);
    }
  }
}

console.log(
  `Vendored ${skillNames.size} skills into ${relative(projectRoot, target)} (${rewritten} sibling links rewritten).`,
);
if (broken.length > 0) {
  console.error("Broken relative links:\n  " + broken.join("\n  "));
  process.exit(1);
}
