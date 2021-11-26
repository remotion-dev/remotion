import os from "os";
import path from "path";
import { getCompositions, renderMedia, openBrowser } from "@remotion/renderer";
import { existsSync } from "fs";

test("Render video with browser instance open", async () => {
  const puppeteerInstance = await openBrowser("chrome");
  const compositions = await getCompositions(
    "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/mlqtbgiywr/index.html",
    {
      puppeteerInstance,
    }
  );

  const reactSvg = compositions.find((c) => c.id === "react-svg");

  if (!reactSvg) {
    throw new Error("not found");
  }

  const tmpDir = os.tmpdir();

  const outPath = path.join(tmpDir, "out.mp4");

  await renderMedia({
    outputLocation: outPath,
    codec: "h264",
    serveUrl:
      "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/mlqtbgiywr/index.html",
    composition: reactSvg,
    frameRange: [0, 2],
    puppeteerInstance,
  });
});

test("Render video with browser instance not open", async () => {
  const compositions = await getCompositions(
    "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/mlqtbgiywr/index.html"
  );

  const reactSvg = compositions.find((c) => c.id === "react-svg");

  if (!reactSvg) {
    throw new Error("not found");
  }

  const tmpDir = os.tmpdir();

  const outPath = path.join(tmpDir, "subdir", "out.mp4");

  await renderMedia({
    outputLocation: outPath,
    codec: "h264",
    serveUrl:
      "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/mlqtbgiywr/index.html",
    composition: reactSvg,
    frameRange: [0, 2],
  });
  expect(existsSync(outPath)).toBe(true);
});

test("should fail on invalid CRF", async () => {
  const tmpDir = os.tmpdir();

  const outPath = path.join(tmpDir, "out.mp4");
  const browserInstance = await openBrowser("chrome");

  await expect(() => {
    return renderMedia({
      outputLocation: outPath,
      codec: "h264",
      serveUrl:
        "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/mlqtbgiywr/index.html",
      // @ts-expect-error
      crf: "wrong",
      config: {
        durationInFrames: 10,
        fps: 30,
        height: 1080,
        id: "hitehre",
        width: 1080,
      },
      frameRange: [0, 2],
      puppeteerInstance: browserInstance,
    });
  }).rejects.toThrow(/Expected CRF to be a number, but is "wrong"/);
});
