import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill } from "@remotion/renderer";
import { elements } from "../elements/registry.ts";

const { values } = parseArgs({
  options: {
    element: { type: "string" },
    "browser-executable": { type: "string" },
    help: { type: "boolean", short: "h" },
  },
});

if (values.help) {
  console.log(
    "Usage: npm run render-previews -- [--element=<slug>] [--browser-executable=<path>]",
  );
  process.exit(0);
}

const selected =
  values.element === undefined
    ? elements
    : elements.filter(({ slug }) => slug === values.element);

if (selected.length === 0)
  throw new Error(`Unknown Element: ${values.element}`);

for (const { slug } of selected) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Invalid Element slug: ${slug}`);
  }
}

const manifestPath = path.resolve("elements/previews.json");

const previews: Record<string, { posterUrl: string; videoUrl: string }> =
  JSON.parse(await readFile(manifestPath, "utf8"));

const browserExecutable = values["browser-executable"] ?? null;

const serveUrl = await bundle({
  entryPoint: path.resolve("remotion/previews.tsx"),
});

const compositions = await getCompositions({
  serveUrl,
  inputProps: {},
  browserExecutable,
});

const version = randomUUID();

for (const definition of selected) {
  const composition = compositions.find(({ id }) => id === definition.slug);

  if (!composition)
    throw new Error(`Missing preview composition: ${definition.slug}`);
  const transparent = definition.previewBackground === "transparent";
  const directory = `/previews/${definition.slug}/${version}`;
  const posterUrl = `${directory}/preview.png`;
  const videoUrl = `${directory}/preview.${transparent ? "webm" : "mp4"}`;
  await mkdir(path.join("public", directory), { recursive: true });
  console.log(`Rendering ${definition.displayName}`);
  await renderStill({
    serveUrl,
    composition,
    browserExecutable,
    frame: definition.posterFrame,
    imageFormat: "png",
    output: path.join("public", posterUrl),
  });
  await renderMedia({
    serveUrl,
    composition,
    browserExecutable,
    codec: transparent ? "vp9" : "h264",
    pixelFormat: transparent ? "yuva420p" : "yuv420p",
    imageFormat: "png",
    crf: transparent ? 30 : 23,
    muted: true,
    outputLocation: path.join("public", videoUrl),
  });
  previews[definition.slug] = { posterUrl, videoUrl };
}

const temporaryManifest = `${manifestPath}.${version}.tmp`;

await writeFile(temporaryManifest, `${JSON.stringify(previews, null, 2)}\n`);

await rename(temporaryManifest, manifestPath);

console.log(
  "Previews rendered. Review them on the website before running upload-previews.",
);
