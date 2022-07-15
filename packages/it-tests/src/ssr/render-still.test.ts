import os from "os";
import {
  getCompositions,
  openBrowser,
  RenderInternals,
  renderStill,
} from "@remotion/renderer";
import path from "path";
import { existsSync } from "fs";
import { afterEach, expect, test } from "vitest";

afterEach(async () => {
  await RenderInternals.killAllBrowsers();
});

test("Render video with browser instance open", async () => {
  const puppeteerInstance = await openBrowser("chrome");
  const compositions = await getCompositions(
    "https://6297949544e290044cecb257--cute-kitsune-214ea5.netlify.app/",
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
      "https://6297949544e290044cecb257--cute-kitsune-214ea5.netlify.app/",
    composition: reactSvg,
    puppeteerInstance,
  });
  await puppeteerInstance.close();
});

test("Render still with browser instance not open and legacy webpack config", async () => {
  const compositions = await getCompositions(
    "https://6297949544e290044cecb257--cute-kitsune-214ea5.netlify.app/"
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
      "https://6297949544e290044cecb257--cute-kitsune-214ea5.netlify.app/",
    composition: reactSvg,
  });
  expect(existsSync(outPath)).toBe(true);
});
