import { createRequire } from "module";
import path from "path";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const require = createRequire(import.meta.url);

export const binaryPath = path.resolve(__dirname, "compositor.exe");
export const ffmpegPath = path.resolve(
  __dirname,
  "ffmpeg",
  "remotion",
  "bin",
  "ffmpeg.exe"
);
export const ffprobePath = path.resolve(
  __dirname,
  "ffmpeg",
  "remotion",
  "bin",
  "ffprobe.exe"
);
export const ffmpegCwd = path.resolve(__dirname, "ffmpeg");
