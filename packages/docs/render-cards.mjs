import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill } from "@remotion/renderer";
import path from "path";

const serveUrl = await bundle({
  entryPoint: path.join(process.cwd(), "./src/remotion/entry.ts"),
  publicDir: path.join(process.cwd(), "static"),
});
const compositions = await getCompositions(serveUrl);

for (const composition of compositions.filter((c) =>
  c.id.startsWith("expert")
)) {
  await renderStill({
    composition,
    output: `static/generated/${composition.id}.png`,
    serveUrl,
  });
  console.log("Rendered", composition.id);
}
