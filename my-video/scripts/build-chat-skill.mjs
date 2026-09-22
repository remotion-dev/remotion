// Builds remotion-video-skill.zip, a self-contained skill bundle that can be
// uploaded to claude.ai (Settings → Capabilities → Skills) for use in Claude
// Chat and Cowork. The uploader accepts at most 200 entries and exactly one
// SKILL.md, so the vendored sub-skills are renamed to GUIDE.md and every link
// to them is rewritten. No dependencies: the zip is written by hand.
//
// Usage: node scripts/build-chat-skill.mjs

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, posix, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(projectRoot, ".claude", "skills");
const bundleName = "remotion-video";
const output = join(projectRoot, "remotion-video-skill.zip");
const maxEntries = 200;

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

const rewriteLinks = (markdown) =>
  markdown.replace(
    /\]\(([^)\s]*?)SKILL\.md(#[^)\s]*)?\)/g,
    (_, prefix, hash = "") => `](${prefix}GUIDE.md${hash})`,
  );

// Bundle entries: { name (zip path, forward slashes), data (Buffer) }.
const entries = [
  {
    name: `${bundleName}/SKILL.md`,
    data: Buffer.from(
      rewriteLinks(
        readFileSync(join(projectRoot, "chat-skill", "SKILL.md"), "utf8"),
      ),
    ),
  },
];

for (const file of walk(skillsDir)) {
  const rel = relative(skillsDir, file).split("\\").join("/");
  const name =
    basename(file) === "SKILL.md"
      ? `${bundleName}/${posix.dirname(rel)}/GUIDE.md`
      : `${bundleName}/${rel}`;
  const data = file.endsWith(".md")
    ? Buffer.from(rewriteLinks(readFileSync(file, "utf8")))
    : readFileSync(file);
  entries.push({ name, data });
}

// Validate what the uploader checks, plus that no relative link is broken.
const names = new Set(entries.map((e) => e.name));
const skillFiles = entries.filter((e) => posix.basename(e.name) === "SKILL.md");
const problems = [];
if (skillFiles.length !== 1) {
  problems.push(`expected exactly one SKILL.md, found ${skillFiles.length}`);
}
if (entries.length > maxEntries) {
  problems.push(`${entries.length} entries exceeds the limit of ${maxEntries}`);
}
for (const entry of entries) {
  if (!entry.name.endsWith(".md")) continue;
  for (const [, link] of entry.data
    .toString("utf8")
    .matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(link)) continue;
    const target = posix.normalize(
      posix.join(posix.dirname(entry.name), link.split("#")[0]),
    );
    if (!names.has(target)) problems.push(`${entry.name} -> ${link} (missing)`);
  }
}
if (problems.length > 0) {
  console.error("Bundle is invalid:\n  " + problems.join("\n  "));
  process.exit(1);
}

// Minimal zip writer (deflate, UTF-8 names, no directory entries).
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let crc = 0xffffffff;
  for (const byte of buf) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const now = new Date();
const dosTime =
  (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
const dosDate =
  ((now.getFullYear() - 1980) << 9) |
  ((now.getMonth() + 1) << 5) |
  now.getDate();

const localParts = [];
const centralParts = [];
let offset = 0;

for (const { name, data } of entries) {
  const nameBytes = Buffer.from(name, "utf8");
  const compressed = deflateRawSync(data);
  const crc = crc32(data);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4); // version needed
  local.writeUInt16LE(0x0800, 6); // UTF-8 names
  local.writeUInt16LE(8, 8); // deflate
  local.writeUInt16LE(dosTime, 10);
  local.writeUInt16LE(dosDate, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBytes.length, 26);
  local.writeUInt16LE(0, 28);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4); // version made by
  central.writeUInt16LE(20, 6); // version needed
  central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(8, 10);
  central.writeUInt16LE(dosTime, 12);
  central.writeUInt16LE(dosDate, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(nameBytes.length, 28);
  central.writeUInt16LE(0, 30); // extra
  central.writeUInt16LE(0, 32); // comment
  central.writeUInt16LE(0, 34); // disk
  central.writeUInt16LE(0, 36); // internal attrs
  central.writeUInt32LE(0, 38); // external attrs
  central.writeUInt32LE(offset, 42);

  localParts.push(local, nameBytes, compressed);
  centralParts.push(central, nameBytes);
  offset += local.length + nameBytes.length + compressed.length;
}

const centralDirectory = Buffer.concat(centralParts);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(0, 4);
end.writeUInt16LE(0, 6);
end.writeUInt16LE(entries.length, 8);
end.writeUInt16LE(entries.length, 10);
end.writeUInt32LE(centralDirectory.length, 12);
end.writeUInt32LE(offset, 16);
end.writeUInt16LE(0, 20);

writeFileSync(output, Buffer.concat([...localParts, centralDirectory, end]));
console.log(
  `Wrote ${relative(projectRoot, output)}: ${entries.length} entries, one SKILL.md, ${Math.round(offset / 1024)} KB. Upload it at claude.ai → Settings → Capabilities → Skills.`,
);
