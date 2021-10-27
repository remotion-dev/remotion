export type FfmpegExecutable = string | null;

let currentFfmpegExecutablePath: FfmpegExecutable = null;

export const setFfmpegExecutable = (ffmpegPath: FfmpegExecutable) => {
	currentFfmpegExecutablePath = ffmpegPath;
};

export const getCustomFfmpegExecutable = () => {
	return currentFfmpegExecutablePath;
};
