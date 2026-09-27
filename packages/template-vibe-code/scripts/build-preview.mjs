// Builds the assets that Next.js does not bundle itself:
//
// 1. public/preview.js – the preview iframe. It needs a *development* build of
//    React so that Fast Refresh can hot-swap the compiled composition without
//    losing state. Next.js serves production React, so the preview is bundled
//    separately with esbuild and loaded in an iframe.
//
// 2. public/compiler/ – the browser bundler's Web Worker together with the
//    Rspack WebAssembly binary and its WASI worker. Serving them as plain
//    static files keeps them out of the Next.js build (they must not be
//    transpiled) and works with both Turbopack and webpack.

import { build } from "esbuild";
import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

const start = Date.now();
await build({
  absWorkingDir: root,
  entryPoints: ["src/preview/entry.ts"],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  outfile: "public/preview.js",
  define: { "process.env.NODE_ENV": JSON.stringify("development") },
  jsx: "automatic",
  minify: true,
  sourcemap: false,
  legalComments: "none",
  logLevel: "warning",
});

const compilerDist = path.join(
  path.dirname(require.resolve("@remotion/browser-bundler/package.json")),
  "dist",
);
const compilerDir = path.join(root, "public", "compiler");
await mkdir(compilerDir, { recursive: true });
for (const asset of [
  "browser-bundler-worker.js",
  "rspack.wasm32-wasi.wasm",
  "wasi-worker-browser.mjs",
]) {
  await copyFile(path.join(compilerDist, asset), path.join(compilerDir, asset));
}

console.log(
  `Built public/preview.js and public/compiler in ${Date.now() - start}ms`,
);
