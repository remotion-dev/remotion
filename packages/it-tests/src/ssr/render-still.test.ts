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
    "https://shimmering-youtiao-218c24.netlify.app/",
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

  const { buffer } = await renderStill({
    output: outPath,
    serveUrl: "https://shimmering-youtiao-218c24.netlify.app/",
    composition: reactSvg,
    puppeteerInstance,
  });
  expect(buffer).toBe(null);
  await puppeteerInstance.close(false, "info", false);
});

test("Render still with browser instance not open and legacy webpack config", async () => {
  const compositions = await getCompositions(
    "https://shimmering-youtiao-218c24.netlify.app/"
  );

  const reactSvg = compositions.find((c) => c.id === "react-svg");

  if (!reactSvg) {
    throw new Error("not found");
  }

  const tmpDir = os.tmpdir();

  const outPath = path.join(tmpDir, "subdir", "out.jpg");

  await renderStill({
    output: outPath,
    serveUrl: "https://shimmering-youtiao-218c24.netlify.app/",
    composition: reactSvg,
  });
  expect(existsSync(outPath)).toBe(true);
});
