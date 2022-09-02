import { RenderInternals } from "@remotion/renderer";
import execa from "execa";
import fs from "fs";
import path from "path";
import { beforeEach, expect, test } from "vitest";

const outputPath = path.join(process.cwd(), "packages/example/out.mp4");

beforeEach(() => {
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
});

test("Should be able to render video", async () => {
  const task = execa(
    "pnpm",
    [
      "exec",
      "remotion",
      "render",
      "src/index.tsx",
      "ten-frame-tester",
      "--codec",
      "h264",
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

  const info = await execa("ffprobe", [outputPath]);
  const data = info.stderr;
  expect(data).toContain("Video: h264");
  expect(data).toContain("yuv420p");
  expect(data).toContain("1080x1080");
  expect(data).toContain("30 fps");
  expect(data).toContain("Audio: aac");
});

test("Should fail to render out of range CRF", async () => {
  const task = await execa(
    "pnpm",
    [
      "exec",
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
      cwd: path.join(process.cwd(), "..", "example"),
      reject: false,
    }
  );
  expect(task.exitCode).toBe(1);
  expect(task.stderr).toContain("CRF must be between ");
});

test("Should fail to render out of range frame when range is a number", async () => {
  const out = outputPath.replace(".mp4", "");

  const task = await execa(
    "pnpm",
    [
      "exec",
      "remotion",
      "render",
      "src/index.tsx",
      "ten-frame-tester",
      "--sequence",
      "--frames=10",
      out,
    ],
    {
      cwd: path.join(process.cwd(), "..", "example"),
      reject: false,
    }
  );
  expect(task.exitCode).toBe(1);
  expect(task.stderr).toContain(
    "Frame number is out of range, must be between 0 and 9"
  );
});

test("Should fail to render out of range frame when range is a string", async () => {
  const task = await execa(
    "pnpm",
    [
      "exec",
      "remotion",
      "render",
      "src/index.tsx",
      "ten-frame-tester",
      "--frames=2-10",
      outputPath,
    ],
    {
      cwd: path.join(process.cwd(), "..", "example"),
      reject: false,
    }
  );
  expect(task.exitCode).toBe(1);
  expect(task.stderr).toContain("Frame range 2-10 is not in between 0-9");
});

test("Should render a ProRes video", async () => {
  const out = outputPath.replace(".mp4", ".mov");
  const task = await execa(
    "pnpm",
    [
      "exec",
      "remotion",
      "render",
      "src/index.tsx",
      "ten-frame-tester",
      "--prores-profile=4444",
      out,
    ],
    {
      cwd: path.join(process.cwd(), "..", "example"),
      reject: false,
    }
  );
  expect(task.exitCode).toBe(0);

  const exists = fs.existsSync(out);
  expect(exists).toBe(true);

  const info = await execa("ffprobe", [out]);
  const data = info.stderr;
  expect(data.includes("prores (4444)") || data.includes("prores (ap4h")).toBe(
    true
  );
  fs.unlinkSync(out);
});

test("Should render a still image if single frame specified", async () => {
  const outDir = outputPath.replace(".mp4", "");
  const outImg = path.join(outDir, "element-2.png");
  const task = await execa(
    "pnpm",
    [
      "exec",
      "remotion",
      "render",
      "src/index.tsx",
      "ten-frame-tester",
      "--frames=2",
      outDir,
    ],
    {
      cwd: path.join(process.cwd(), "..", "example"),
      reject: false,
    }
  );
  expect(task.exitCode).toBe(0);
  expect(fs.existsSync(outImg)).toBe(true);

  const info = await execa("ffprobe", [outImg]);
  const data = info.stderr;
  expect(data).toContain("Video: png");
  expect(data).toContain("png_pipe");
  await (fs.promises.rm ?? fs.promises.rmdir)(outDir, {
    recursive: true,
  });
});

test("Should be able to render a WAV audio file", async () => {
  const out = outputPath.replace("mp4", "wav");
  const task = execa(
    "pnpm",
    ["exec", "remotion", "render", "src/index.tsx", "audio-testing", out],
    {
      cwd: path.join(process.cwd(), "..", "example"),
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
  expect(data).toContain("bitrate: 1536 kb/s");
  expect(data).toContain("Stream #0");
  expect(data).not.toContain("Stream #1");
  fs.unlinkSync(out);
});

test("Should be able to render a MP3 audio file", async () => {
  const out = outputPath.replace("mp4", "mp3");
  const task = execa(
    "pnpm",
    ["exec", "remotion", "render", "src/index.tsx", "audio-testing", out],
    {
      cwd: path.join(process.cwd(), "..", "example"),
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
  expect(data).toContain("320 kb/s");
  expect(data).toContain("Stream #0");
  expect(data).not.toContain("Stream #1");
  fs.unlinkSync(out);
});

test("Should be able to render a AAC audio file", async () => {
  const out = outputPath.replace("mp4", "aac");
  const task = execa(
    "pnpm",
    ["exec", "remotion", "render", "src/index.tsx", "audio-testing", out],
    {
      cwd: path.join(process.cwd(), "..", "example"),
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
  expect(data).toMatch(/(4|5) kb\/s/);
  expect(data).toContain("Stream #0");
  expect(data).not.toContain("Stream #1");
  fs.unlinkSync(out);
});

test("Should render a video with GIFs", async () => {
  const task = await execa(
    "pnpm",
    [
      "exec",
      "remotion",
      "render",
      "src/index.tsx",
      "gif",
      "--frames=0-47",
      outputPath,
    ],
    {
      cwd: path.join(process.cwd(), "..", "example"),
      reject: false,
    }
  );
  expect(task.exitCode).toBe(0);
  expect(fs.existsSync(outputPath)).toBe(true);

  const info = await execa("ffprobe", [outputPath]);
  const data = info.stderr;
  expect(data).toContain("Video: h264");

  expect(data).toContain("Duration: 00:00:01.60");

  fs.unlinkSync(outputPath);
});

test("Should render a video with Offline Audio-context", async () => {
  const out = outputPath.replace(".mp4", ".mp3");

  const task = await execa(
    "pnpm",
    [
      "exec",
      "remotion",
      "render",
      "src/index.tsx",
      "offline-audio-buffer",
      out,
    ],
    {
      cwd: path.join(process.cwd(), "..", "example"),
      reject: false,
    }
  );
  expect(task.exitCode).toBe(0);
  expect(fs.existsSync(out)).toBe(true);

  const info = await execa("ffprobe", [out]);
  const data = info.stderr;
  expect(data).toContain("Stream #0:0: Audio: mp3");
  expect(data).toContain("48000 Hz, stereo");
  fs.unlinkSync(out);
});

test("Should succeed to render an audio file that doesn't have any audio inputs", async () => {
  const out = outputPath.replace(".mp4", ".mp3");
  const task = await execa(
    "pnpm",
    ["exec", "remotion", "render", "src/index.tsx", "ten-frame-tester", out],
    {
      cwd: path.join(process.cwd(), "..", "example"),
      reject: false,
    }
  );
  expect(task.exitCode).toBe(0);
  const info = await execa("ffprobe", [out]);
  const data = info.stderr;
  expect(data).toContain("Duration: 00:00:00.36");
  expect(data).toContain("Audio: mp3, 48000 Hz");
  fs.unlinkSync(out);
});

test("Should render a still that uses the staticFile() API", async () => {
  const out = outputPath.replace(".mp4", ".png");
  const task = await execa(
    "pnpm",
    [
      "exec",
      "remotion",
      "still",
      "src/index.tsx",
      "static-demo",
      out,
      "--log=verbose",
    ],
    {
      cwd: path.join(process.cwd(), "..", "example"),
      reject: false,
    }
  );
  expect(task.exitCode).toBe(0);
  fs.unlinkSync(out);
});

test("Dynamic duration should work, and render from inside src/", async () => {
  const randomDuration = Math.round(Math.random() * 18 + 2);
  const task = await execa(
    path.join(
      process.cwd(),
      "..",
      "example",
      "node_modules",
      ".bin",
      "remotion"
    ),
    [
      "render",
      "index.tsx",
      "dynamic-duration",
      `--props`,
      `{"duration": ${randomDuration}}`,
      outputPath,
    ],
    {
      cwd: path.join(process.cwd(), "..", "example", "src"),
      reject: false,
    }
  );

  expect(task.exitCode).toBe(0);
  expect(fs.existsSync(outputPath)).toBe(true);

  const info = await execa("ffprobe", [outputPath]);
  const data = info.stderr;
  expect(data).toContain("Video: h264");
  const expectedDuration = (randomDuration / 30).toFixed(2);
  const ffmpegVersion = await RenderInternals.getFfmpegVersion({
    ffmpegExecutable: null,
  });
  if (ffmpegVersion && ffmpegVersion[0] === 4 && ffmpegVersion[1] > 1) {
    expect(data).toContain(`Duration: 00:00:0${expectedDuration}`);
  }

  fs.unlinkSync(outputPath);
});

test("Should be able to render if remotion.config.js is not provided", async () => {
  const task = await execa(
    "node",
    [
      "packages/cli/remotion-cli.js",
      "render",
      "packages/example/src/entry.jsx",
      "framer",
      outputPath,
    ],
    {
      reject: false,
      cwd: path.join(process.cwd(), "..", ".."),
    }
  );

  expect(task.exitCode).toBe(0);
  fs.unlinkSync(outputPath);
});

test("Should be able to render if remotion.config.ts is not provided", async () => {
  const task = await execa(
    "node",
    [
      "packages/cli/remotion-cli.js",
      "render",
      "packages/example/src/ts-entry.tsx",
      "framer",
      outputPath,
    ],
    {
      cwd: path.join(process.cwd(), "..", ".."),
      reject: false,
    }
  );

  expect(task.exitCode).toBe(0);
  fs.unlinkSync(outputPath);
});
