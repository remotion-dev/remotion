// Removes the copies of the compiler assets that Turbopack emits into
// .next/static/media (and the static export of it) after `next build`.
//
// @remotion/browser-bundler refers to its worker with
// `new URL("./browser-bundler-worker.js", import.meta.url)` as a fallback for
// apps that do not pass `workerUrl`, and the worker refers to the WebAssembly
// binary and the WASI worker the same way. Turbopack bundles everything such a
// URL points to, which adds a second 32 MB copy of the files to the build.
// This app always passes `workerUrl` (see use-compiler.ts) and loads them from
// public/compiler instead, so the copies are never requested.

import { readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compilerAssets } from "./compiler-assets.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Turbopack inserts a hash: browser-bundler-worker.1s-aib4z2khvm.js
const isCompilerAsset = (fileName) =>
  compilerAssets.some((asset) => {
    const extension = path.extname(asset);
    return (
      fileName.startsWith(`${asset.slice(0, -extension.length)}.`) &&
      fileName.endsWith(extension)
    );
  });

let removed = 0;
for (const mediaDir of [".next/static/media", "out/_next/static/media"]) {
  const dir = path.join(root, mediaDir);
  for (const fileName of await readdir(dir).catch(() => [])) {
    if (isCompilerAsset(fileName)) {
      await rm(path.join(dir, fileName));
      removed++;
    }
  }
}

console.log(`Removed ${removed} duplicate compiler assets from the build`);
