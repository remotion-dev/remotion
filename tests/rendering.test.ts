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
  const exists = fs.existsSync(out);
  expect(exists).toBe(true);

  const info = await execa("ffprobe", [out]);
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
  const exists = fs.existsSync(out);
  expect(exists).toBe(true);

  const info = await execa("ffprobe", [out]);
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
  const exists = fs.existsSync(out);
  expect(exists).toBe(true);

  const info = await execa("ffprobe", [out]);
  const data = info.stderr;
  expect(data).toContain("aac");
  expect(data).toContain("stereo");
  expect(data).toContain("fltp");
  expect(data).not.toContain("Kevin MacLeod");
  expect(data).toContain("4 kb/s");
  expect(data).toContain("Stream #0");
  expect(data).not.toContain("Stream #1");
  fs.unlinkSync(out);
});

test("Should render a video with GIFs", async () => {
  const task = await execa(
    "npx",
    ["remotion", "render", "src/index.tsx", "gif", "--frames=0-47", outputPath],
    {
      cwd: "packages/example",
      reject: false,
    }
  );
  expect(task.exitCode).toBe(0);
  expect(fs.existsSync(outputPath)).toBe(true);

  const info = await execa("ffprobe", [outputPath]);
  const data = info.stderr;
  expect(data).toContain("Video: h264");
  expect(data).toContain("Duration: 00:00:01.57");
  fs.unlinkSync(outputPath);
});

test("Should fail to render an audio file that doesn't have any audio inputs", async () => {
  const out = outputPath.replace(".mp4", ".mp3");
  const task = await execa(
    "npx",
    ["remotion", "render", "src/index.tsx", "ten-frame-tester", out],
    {
      cwd: "packages/example",
      reject: false,
    }
  );
  expect(task.exitCode).toBe(process.platform === "win32" ? 0 : 1);
  expect(task.stderr).toContain(
    "Cannot render - you are trying to generate an audio file (mp3) but your composition doesn't contain any audio."
  );
});

test("Dynamic duration should work", async () => {
  const randomDuration = Math.round(Math.random() * 18 + 2);
  const task = await execa(
    "npx",
    [
      "remotion",
      "render",
      "src/index.tsx",
      "dynamic-duration",
      `--props`,
      `{"duration": ${randomDuration}}`,
      outputPath,
    ],
    {
      cwd: "packages/example",
      reject: false,
    }
  );

  expect(task.exitCode).toBe(0);
  // FIXME: --props don't work well on windows, this is an edge case for example
  // In this case we should warn the user about it that they should pass a file path instead
  expect(fs.existsSync(outputPath)).toBe(process.platform !== "win32");

  if (process.platform !== "win32") {
    const info = await execa("ffprobe", [outputPath]);
    const data = info.stderr;
    expect(data).toContain("Video: h264");
    const expectedDuration = (randomDuration / 30).toFixed(2);
    expect(data).toContain(`Duration: 00:00:0${expectedDuration}`);
    fs.unlinkSync(outputPath);
  }
});
