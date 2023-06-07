import fs from "fs";
import os from "os";
import path from "path";
import {
  getCompositions,
  openBrowser,
  renderFrames,
  stitchFramesToVideo,
} from "@remotion/renderer";
import { expect, test } from "vitest";
import { RenderInternals } from "@remotion/renderer";

test("Legacy SSR way of rendering videos should still work", async () => {
  const puppeteerInstance = await openBrowser("chrome");
  const compositions = await getCompositions(
    "https://64804c64f424474c4b192d49--sage-sable-226d60.netlify.app/",
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
    composition: reactSvg,
    imageFormat: "jpeg",
    inputProps: {},
    onFrameUpdate: () => undefined,
    serveUrl:
      "https://64804c64f424474c4b192d49--sage-sable-226d60.netlify.app/",
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
  const probe = await RenderInternals.callFf("ffprobe", [outPath]);
  expect(probe.stderr).toMatch(/Video: h264/);

  RenderInternals.deleteDirectory(framesDir);
  await puppeteerInstance.close(false);
});
