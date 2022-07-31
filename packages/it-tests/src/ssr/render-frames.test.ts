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

test("Legacy SSR way of rendering videos should still work", async () => {
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
    webpackBundle:
      "https://6297949544e290044cecb257--cute-kitsune-214ea5.netlify.app/",
    parallelism: null,
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
  const probe = await execa("ffprobe", [outPath]);
  expect(probe.stderr).toMatch(/Video: h264/);
  await puppeteerInstance.close();
});
