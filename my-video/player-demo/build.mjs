// Bundles player-demo/main.tsx into player-demo/dist/ with the esbuild that
// is already in node_modules (a dependency of @remotion/bundler), and copies
// index.html next to it.
//
//   node player-demo/build.mjs           build once
//   node player-demo/build.mjs --serve   build, then serve dist/ on :4000
import {copyFileSync, mkdirSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import * as esbuild from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const outdir = join(here, "dist");
mkdirSync(outdir, {recursive: true});
copyFileSync(join(here, "index.html"), join(outdir, "index.html"));

const options = {
  entryPoints: [join(here, "main.tsx")],
  outfile: join(outdir, "main.js"),
  bundle: true,
  // A classic script rather than an ES module, so dist/index.html also works
  // when opened straight from disk (file://), not only from a server.
  format: "iife",
  platform: "browser",
  // Set explicitly instead of read from ../tsconfig.json.
  jsx: "automatic",
  define: {"process.env.NODE_ENV": '"production"'},
  minify: true,
  sourcemap: true,
  logLevel: "info",
};

if (process.argv.includes("--serve")) {
  const ctx = await esbuild.context(options);
  await ctx.rebuild();
  const {port} = await ctx.serve({servedir: outdir, port: 4000});
  console.log(`Serving player-demo/dist on http://localhost:${port}/`);
} else {
  await esbuild.build(options);
}
