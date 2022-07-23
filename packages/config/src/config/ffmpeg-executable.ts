import { FfmpegExecutable } from "@remotion/renderer";

let currentFfmpegExecutablePath: FfmpegExecutable = null;
let currentFfprobeExecutablePath: FfmpegExecutable = null;

export const setFfmpegExecutable = (ffmpegPath: FfmpegExecutable) => {
  currentFfmpegExecutablePath = ffmpegPath;
};

export const getCustomFfmpegExecutable = () => {
  return currentFfmpegExecutablePath;
};

export const setFfprobeExecutable = (ffprobePath: FfmpegExecutable) => {
  currentFfprobeExecutablePath = ffprobePath;
};

export const getCustomFfprobeExecutable = () => {
  return currentFfprobeExecutablePath;
};
