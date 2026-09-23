// Bundles player-demo/main.tsx into player-demo/dist/ with the esbuild that
// is already in node_modules (a dependency of @remotion/bundler), and copies
// index.html next to it.
//
//   node player-demo/build.mjs           build once
//   node player-demo/build.mjs --serve   build, then serve dist/ on :4000
import {copyFileSync, createReadStream, existsSync, mkdirSync, statSync} from "node:fs";
import {createServer} from "node:http";
import {dirname, extname, join} from "node:path";
import {fileURLToPath} from "node:url";
import * as esbuild from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const outdir = join(here, "dist");
mkdirSync(outdir, {recursive: true});
copyFileSync(join(here, "index.html"), join(outdir, "index.html"));
// The reel's staticFile() assets. index.html sets window.remotion_staticBase
// to ".", so staticFile("sample-clip.webm") resolves next to the page, both
// when served and when opened from disk.
for (const asset of ["sample-clip.webm"]) {
  copyFileSync(join(here, "..", "public", asset), join(outdir, asset));
}

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

await esbuild.build(options);

if (process.argv.includes("--serve")) {
  // Not esbuild's own server: it doesn't answer HTTP Range requests, and a
  // <video> can only seek within a file that's served with them.
  const types = {".html": "text/html", ".js": "text/javascript", ".map": "application/json", ".webm": "video/webm"};
  createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = join(outdir, pathname.endsWith("/") ? `${pathname}index.html` : pathname);
    if (!file.startsWith(outdir) || !existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    const size = statSync(file).size;
    const headers = {"Content-Type": types[extname(file)] ?? "application/octet-stream", "Accept-Ranges": "bytes"};
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
    if (!range) {
      res.writeHead(200, {...headers, "Content-Length": size});
      createReadStream(file).pipe(res);
      return;
    }
    // "bytes=a-b", "bytes=a-" or the suffix form "bytes=-n".
    const start = range[1] === "" ? size - Number(range[2]) : Number(range[1]);
    const end = range[1] !== "" && range[2] !== "" ? Math.min(Number(range[2]), size - 1) : size - 1;
    res.writeHead(206, {...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1});
    createReadStream(file, {start, end}).pipe(res);
  }).listen(4000, () => console.log("Serving player-demo/dist on http://localhost:4000/"));
}
