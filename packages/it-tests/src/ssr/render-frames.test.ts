import fs from "fs";
import os from "os";
import path from "path";
import {
  getCompositions,
  openBrowser,
  renderFrames,
  stitchFramesToVideo,
} from "@remotion/renderer";
import execa from "execa";
import { expect, test } from "vitest";
import { RenderInternals } from "@remotion/renderer";

test("Legacy SSR way of rendering videos should still work", async () => {
  const puppeteerInstance = await openBrowser("chrome");
  const compositions = await getCompositions(
    "https://gleaming-wisp-de5d2a.netlify.app/",
    {
      puppeteerInstance,
    }
  );

  const reactSvg = compositions.find((c) => c.id === "react-svg");

  if (!reactSvg) {
    throw new Error("not found");
  }

  const tmpDir = os.tmpdir();

  // We create a temporary directory for storing the frames
  const framesDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "remotion-")
  );

  const outPath = path.join(tmpDir, "out.mp4");

  const { assetsInfo } = await renderFrames({
    config: reactSvg,
    imageFormat: "jpeg",
    inputProps: {},
    onFrameUpdate: () => undefined,
    webpackBundle: "https://gleaming-wisp-de5d2a.netlify.app/",
    concurrency: null,
    frameRange: [0, 10],
    outputDir: framesDir,
    onStart: () => undefined,
  });

  await stitchFramesToVideo({
    dir: framesDir,
    assetsInfo,
    force: true,
    fps: reactSvg.fps,
    height: reactSvg.height,
    outputLocation: outPath,
    width: reactSvg.width,
    codec: "h264",
  });
  expect(fs.existsSync(outPath)).toBe(true);
  const probe = await execa(
    await RenderInternals.getExecutableBinary(null, process.cwd(), "ffprobe"),
    [outPath]
  );
  expect(probe.stderr).toMatch(/Video: h264/);
  await puppeteerInstance.close();
});
