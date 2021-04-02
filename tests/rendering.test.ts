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
      "ten-frame-tester",
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
  expect(data).toContain("1080x1080");
  expect(data).toContain("30 fps");
});

test("Should fail to render conflicting --sequence and --codec settings", async () => {
  const task = await execa(
    "npx",
    [
      "remotion",
      "render",
      "src/index.tsx",
      "ten-frame-tester",
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
      "ten-frame-tester",
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
  const out = outputPath.replace(".mp4", "");

  const task = await execa(
    "npx",
    [
      "remotion",
      "render",
      "src/index.tsx",
      "ten-frame-tester",
      "--sequence",
      "--frames=10",
      out,
    ],
    {
      cwd: "packages/example",
      reject: false,
    }
  );
  expect(task.exitCode).toBe(process.platform === "win32" ? 0 : 1);
  expect(task.stderr).toContain(
    "Frame number is out of range, must be between 0 and 9"
  );
  fs.unlinkSync(out);
});

test("Should fail to render out of range frame when range is a string", async () => {
  const task = await execa(
    "npx",
    [
      "remotion",
      "render",
      "src/index.tsx",
      "ten-frame-tester",
      "--frames=2-10",
      outputPath,
    ],
    {
      cwd: "packages/example",
      reject: false,
    }
  );
  expect(task.exitCode).toBe(process.platform === "win32" ? 0 : 1);
  expect(task.stderr).toContain("Frame range 2-10 is not in between 0-9");
});

test("Should render a still image if single frame specified", async () => {
  const outDir = outputPath.replace(".mp4", "");
  const outImg = path.join(outDir, "element-2.png");
  const task = await execa(
    "npx",
    [
      "remotion",
      "render",
      "src/index.tsx",
      "ten-frame-tester",
      "--frames=2",
      outDir,
    ],
    {
      cwd: "packages/example",
      reject: false,
    }
  );
  expect(task.exitCode).toBe(0);
  expect(fs.existsSync(outImg)).toBe(true);

  const info = await execa("ffprobe", [outImg]);
  const data = info.stderr;
  expect(data).toContain("Video: png");
  expect(data).toContain("png_pipe");
  fs.rmdirSync(outDir, {
    recursive: true,
  });
});

test("Should be able to render a WAV audio file", async () => {
  const out = outputPath.replace("mp4", "wav");
  const task = execa(
    "npx",
    ["remotion", "render", "src/index.tsx", "audio-testing", out],
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
  expect(data).toContain("pcm_s16le");
  expect(data).toContain("2 channels");
  expect(data).toContain("Kevin MacLeod");
  expect(data).toContain("bitrate: 1411 kb/s");
  expect(data).toContain("Stream #0");
  expect(data).not.toContain("Stream #1");
  fs.unlinkSync(out);
});

test("Should be able to render a MP3 audio file", async () => {
  const out = outputPath.replace("mp4", "mp3");
  const task = execa(
    "npx",
    ["remotion", "render", "src/index.tsx", "audio-testing", out],
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
  expect(data).toContain("mp3");
  expect(data).toContain("stereo");
  expect(data).toContain("fltp");
  expect(data).toContain("Kevin MacLeod");
  expect(data).toContain("128 kb/s");
  expect(data).toContain("Stream #0");
  expect(data).not.toContain("Stream #1");
  fs.unlinkSync(out);
});

test("Should be able to render a AAC audio file", async () => {
  const out = outputPath.replace("mp4", "aac");
  const task = execa(
    "npx",
    ["remotion", "render", "src/index.tsx", "audio-testing", out],
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
  expect(data).toContain("aac");
  expect(data).not.toContain("mp3");
  expect(data).toContain("stereo");
  expect(data).toContain("fltp");
  expect(data).not.toContain("Kevin MacLeod");
  expect(data).toContain("4 kb/s");
  expect(data).toContain("Stream #0");
  expect(data).not.toContain("Stream #1");
  fs.unlinkSync(out);
});
