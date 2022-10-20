import fs from "fs";
import execa from "execa";
import path from "path";
import { beforeEach, expect, test } from "vitest";
import { RenderInternals } from "@remotion/renderer";

const outputPath = path.join(process.cwd(), "packages/example/out.mp4");

beforeEach(() => {
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
});

test("Should be able to render video with scale 2", async () => {
  const task = execa(
    "pnpm",
    [
      "exec",
      "remotion",
      "render",
      "src/index.tsx",
      "ten-frame-tester",
      "--frames",
      "0-1",
      "--codec",
      "h264",
      "--scale",
      "2",
      outputPath,
    ],
    {
      cwd: path.join(process.cwd(), "..", "example"),
    }
  );
  task.stderr?.pipe(process.stderr);
  await task;
  const exists = fs.existsSync(outputPath);
  expect(exists).toBe(true);

  const info = await execa(
    await RenderInternals.getExecutableFfmpeg(null, process.cwd(), "ffprobe"),
    [outputPath]
  );
  const data = info.stderr;
  expect(data).toContain("Video: h264");
  expect(data).toContain("yuv420p");
  expect(data).toContain("2160x2160");
  expect(data).toContain("30 fps");
});

test("Should be able to render video with scale 0.1", async () => {
  const task = execa(
    "pnpm",
    [
      "exec",
      "remotion",
      "render",
      "src/index.tsx",
      "ten-frame-tester",
      "--frames",
      "0-1",
      "--codec",
      "h264",
      "--scale",
      "0.1",
      outputPath,
    ],
    {
      cwd: path.join(process.cwd(), "..", "example"),
    }
  );
  task.stderr?.pipe(process.stderr);
  await task;
  const exists = fs.existsSync(outputPath);
  expect(exists).toBe(true);

  const info = await execa(
    await RenderInternals.getExecutableFfmpeg(null, process.cwd(), "ffprobe"),
    [outputPath]
  );
  const data = info.stderr;
  expect(data).toContain("Video: h264");
  expect(data).toContain("yuv420p");
  expect(data).toContain("108x108");
  expect(data).toContain("30 fps");
});
