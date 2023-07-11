import path from "node:path";
import { expect, test } from "vitest";
import { getVideoMetadata } from "@remotion/renderer";

import { existsSync } from "node:fs";

test("Should return video metadata", async () => {
  const videoFile = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "example",
    "src",
    "resources",
    "framer-24fps.mp4"
  );
  expect(existsSync(videoFile)).toEqual(true);

  const metadataResponse = await getVideoMetadata(videoFile);

  expect(metadataResponse).toEqual({
    fps: 24,
    width: 1080,
    height: 1080,
    durationInSeconds: 4.166667,
  });
});

test("Should return an error due to non existing file", async () => {
  try {
    await getVideoMetadata("invalid");
  } catch (err) {
    expect((err as Error).message).toContain(
      "Compositor error: No such file or directory"
    );
  }
});

test("Should return an error due to using a audio file", async () => {
  const audioFile = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "example",
    "src",
    "resources",
    "sound1.mp3"
  );
  expect(existsSync(audioFile)).toEqual(true);

  try {
    await getVideoMetadata(audioFile);
  } catch (err) {
    expect((err as Error).message).toContain(
      "Compositor error: No video stream found"
    );
  }
});
