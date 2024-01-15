import path from "path";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export const binaryPath = `${__dirname}${path.sep}compositor.exe`;
export const ffmpegPath = `${__dirname}${path.sep}ffmpeg${path.sep}remotion${path.sep}bin${path.sep}ffmpeg.exe`;
export const ffprobePath = `${__dirname}${path.sep}ffmpeg${path.sep}remotion${path.sep}bin${path.sep}ffprobe.exe`;
export const ffmpegCwd = `${__dirname}${path.sep}ffmpeg`;
