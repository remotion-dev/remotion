import os from "os";
import path from "path";
import { getCompositions, renderMedia, openBrowser } from "@remotion/renderer";
import { existsSync } from "fs";
import { expect, test } from "vitest";

test("Render video with browser instance open", async () => {
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

  const outPath = path.join(tmpDir, "out.mp4");

  await renderMedia({
    outputLocation: outPath,
    codec: "h264",
    serveUrl:
      "https://64804c64f424474c4b192d49--sage-sable-226d60.netlify.app/",
    composition: reactSvg,
    frameRange: [0, 2],
    puppeteerInstance,
  });
  await puppeteerInstance.close(false);
  expect(existsSync(outPath)).toBe(true);
});

test("Render video with browser instance not open", async () => {
  const compositions = await getCompositions(
    "https://64804c64f424474c4b192d49--sage-sable-226d60.netlify.app/"
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
      "https://64804c64f424474c4b192d49--sage-sable-226d60.netlify.app/",
    composition: reactSvg,
    frameRange: [0, 2],
  });
  expect(existsSync(outPath)).toBe(true);
});

test("should fail on invalid CRF", async () => {
  const tmpDir = os.tmpdir();

  const outPath = path.join(tmpDir, "out.mp4");
  const browserInstance = await openBrowser("chrome");

  try {
    await renderMedia({
      outputLocation: outPath,
      codec: "h264",
      serveUrl:
        "https://64804c64f424474c4b192d49--sage-sable-226d60.netlify.app/",
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
    throw new Error("render should have failed");
  } catch (err) {
    expect((err as Error).message).toMatch(
      /Expected CRF to be a number, but is "wrong"/
    );
  }

  await browserInstance.close(false);
});

test("Render video to a buffer", async () => {
  const compositions = await getCompositions(
    "https://64804c64f424474c4b192d49--sage-sable-226d60.netlify.app/"
  );

  const reactSvg = compositions.find((c) => c.id === "react-svg");

  if (!reactSvg) {
    throw new Error("not found");
  }

  const { buffer } = await renderMedia({
    codec: "h264",
    serveUrl:
      "https://64804c64f424474c4b192d49--sage-sable-226d60.netlify.app/",
    composition: reactSvg,
    frameRange: [0, 2],
  });

  expect(buffer?.length).toBeGreaterThan(2000);
});
