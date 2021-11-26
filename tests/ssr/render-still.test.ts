import os from "os";
import { getCompositions, openBrowser, renderStill } from "@remotion/renderer";
import path from "path";
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

  await renderStill({
    output: outPath,
    serveUrl:
      "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/mlqtbgiywr/index.html",
    composition: reactSvg,
    puppeteerInstance,
  });
});

test("Render still with browser instance not open and legacy webpack config", async () => {
  const compositions = await getCompositions(
    "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/mlqtbgiywr/index.html"
  );

  const reactSvg = compositions.find((c) => c.id === "react-svg");

  if (!reactSvg) {
    throw new Error("not found");
  }

  const tmpDir = os.tmpdir();

  const outPath = path.join(tmpDir, "subdir", "out.jpg");

  await renderStill({
    output: outPath,
    webpackBundle:
      "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/mlqtbgiywr/index.html",
    composition: reactSvg,
  });
  expect(existsSync(outPath)).toBe(true);
});
