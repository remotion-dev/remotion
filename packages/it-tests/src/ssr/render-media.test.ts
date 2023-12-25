import os from "os";
import path from "path";
import { getCompositions, renderMedia, openBrowser } from "@remotion/renderer";
import { existsSync } from "fs";
import { expect, test } from "vitest";

test("Render video with browser instance open", async () => {
  const puppeteerInstance = await openBrowser("chrome");
  const compositions = await getCompositions(
    "https://64d3734a6bb69052c34d3616--spiffy-kelpie-71657b.netlify.app/",
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
      "https://64d3734a6bb69052c34d3616--spiffy-kelpie-71657b.netlify.app/",
    composition: reactSvg,
    frameRange: [0, 2],
    puppeteerInstance,
  });
  await puppeteerInstance.close(false, "info", false);
  expect(existsSync(outPath)).toBe(true);
});

test("Render video with browser instance not open", async () => {
  const compositions = await getCompositions(
    "https://64d3734a6bb69052c34d3616--spiffy-kelpie-71657b.netlify.app/"
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
      "https://64d3734a6bb69052c34d3616--spiffy-kelpie-71657b.netlify.app/",
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
        "https://64d3734a6bb69052c34d3616--spiffy-kelpie-71657b.netlify.app/",
      // @ts-expect-error
      crf: "wrong",
      composition: {
        durationInFrames: 10,
        fps: 30,
        height: 1080,
        id: "hitehre",
        width: 1080,
        defaultProps: {},
        props: {},
        defaultCodec: null,
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

  await browserInstance.close(false, "info", false);
});

test("Render video to a buffer", async () => {
  const compositions = await getCompositions(
    "https://64d3734a6bb69052c34d3616--spiffy-kelpie-71657b.netlify.app/"
  );

  const reactSvg = compositions.find((c) => c.id === "react-svg");

  if (!reactSvg) {
    throw new Error("not found");
  }

  const { buffer } = await renderMedia({
    codec: "h264",
    serveUrl:
      "https://64d3734a6bb69052c34d3616--spiffy-kelpie-71657b.netlify.app/",
    composition: reactSvg,
    frameRange: [0, 2],
  });

  expect(buffer?.length).toBeGreaterThan(2000);
});

test("Should fail invalid serve URL", async () => {
  try {
    await renderMedia({
      codec: "h264",
      serveUrl:
        "https://remotionlambda-gc1w0xbfzl.s3.eu-central-1.amazonaws.com/sites/Ignition-SessionResultStoryVideo/index.html",
      composition: {
        defaultProps: {},
        durationInFrames: 10,
        fps: 30,
        height: 1080,
        id: "hitehre",
        width: 1080,
        props: {},
        defaultCodec: null,
      },
    });
  } catch (err) {
    expect((err as Error).message).toMatch(/Error while getting compositions/);
    return;
  }

  throw new Error("should have failed");
});
