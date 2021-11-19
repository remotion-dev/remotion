import os from "os";
import path from "path";
import { getCompositions, renderMedia, openBrowser } from "@remotion/renderer";

test("Render video", async () => {
  const compositions = await getCompositions(
    "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/mlqtbgiywr/index.html"
  );

  const reactSvg = compositions.find((c) => c.id === "react-svg");

  const browserInstance = await openBrowser("chrome");
  if (!reactSvg) {
    throw new Error("not found");
  }

  const tmpDir = os.tmpdir();

  const outPath = path.join(tmpDir, "out.mp4");

  await renderMedia({
    absoluteOutputFile: outPath,
    codec: "h264",
    serveUrl:
      "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/mlqtbgiywr/index.html",
    config: reactSvg,
    crf: 15,
    dumpBrowserLogs: false,
    ffmpegExecutable: null,
    frameRange: [0, 2],
    imageFormat: "jpeg",
    inputProps: {},
    openedBrowser: browserInstance,
    parallelism: null,
  });
});
