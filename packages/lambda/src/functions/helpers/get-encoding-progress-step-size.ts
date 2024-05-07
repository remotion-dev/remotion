export const getEncodingProgressStepSize = (totalFrames: number) => {
	return Math.min(100, Math.max(5, totalFrames / 10));
};
