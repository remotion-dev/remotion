import execa from "execa";
import fs from "fs";
import path from "path";

const outputPath = path.join(process.cwd(), "packages/example/out.mp4");

beforeEach(() => {
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
});

test("Should be able to render video", async () => {
  const task = execa(
    "npx",
    [
      "remotion",
      "render",
      "src/index.tsx",
      "shadow-circles",
      "--codec",
      "h264",
      outputPath,
    ],
    {
      cwd: "packages/example",
    }
  );
  task.stderr?.pipe(process.stderr);
  await task;
  const exists = fs.existsSync(outputPath);
  expect(exists).toBe(true);

  const info = await execa("ffprobe", [outputPath]);
  const data = info.stderr;
  expect(data).toContain("Video: h264");
  expect(data).toContain("yuv420p");
  expect(data).toContain("1080x1920");
  expect(data).toContain("30 fps");
});

test("Should fail to render conflicting --sequence and --codec settings", async () => {
  const task = await execa(
    "npx",
    [
      "remotion",
      "render",
      "src/index.tsx",
      "shadow-circles",
      "--codec",
      "h264",
      "--sequence",
      outputPath,
    ],
    {
      cwd: "packages/example",
      reject: false,
    }
  );
  expect(task.exitCode).toBe(process.platform === "win32" ? 0 : 1);
  expect(task.stderr).toContain("Detected both --codec");
});

test("Should fail to render out of range CRF", async () => {
  const task = await execa(
    "npx",
    [
      "remotion",
      "render",
      "src/index.tsx",
      "shadow-circles",
      "--codec",
      "vp8",
      // Range of VP8 values is 4-63
      "--crf",
      "3",
      outputPath.replace("mp4", "webm"),
    ],
    {
      cwd: "packages/example",
      reject: false,
    }
  );
  expect(task.exitCode).toBe(process.platform === "win32" ? 0 : 1);
  expect(task.stderr).toContain("CRF must be between ");
});

test("Should fail to render out of range frame when range is a number", async () => {
  const task = await execa(
    "npx",
    [
      "remotion",
      "render",
      "src/index.tsx",
      "react-svg",
      '--range=301',
      outputPath,
    ],
    {
      cwd: "packages/example",
      reject: false,
    }
  );
  expect(task.exitCode).toBe(process.platform === "win32" ? 0 : 1);
  expect(task.stderr).toContain("is greater than actual");
});

test("Should fail to render out of range frame when range is a string", async () => {
  const task = await execa(
    "npx",
    [
      "remotion",
      "render",
      "src/index.tsx",
      "react-svg",
      '--range=45-301',
      outputPath,
    ],
    {
      cwd: "packages/example",
      reject: false,
    }
  );
  expect(task.exitCode).toBe(process.platform === "win32" ? 0 : 1);
  expect(task.stderr).toContain("is not in between");
});
