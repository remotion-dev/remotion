import { createRequire } from "module";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const require = createRequire(import.meta.url);

export const binaryPath = require.resolve("./compositor");
export const ffmpegPath = require.resolve("./ffmpeg/remotion/bin/ffmpeg");
export const ffprobePath = require.resolve("./ffmpeg/remotion/bin/ffprobe");
export const ffmpegCwd = __dirname + "/ffmpeg";
