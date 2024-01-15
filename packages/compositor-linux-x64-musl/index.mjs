import * as url from "node:url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export const binaryPath = `${__dirname}/compositor`;
export const ffmpegPath = `${__dirname}/ffmpeg/remotion/bin/ffmpeg`;
export const ffprobePath = `${__dirname}/ffmpeg/remotion/bin/ffprobe`;
export const ffmpegCwd = `${__dirname}/ffmpeg`;
