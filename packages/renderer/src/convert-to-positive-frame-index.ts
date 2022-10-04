// Handle negative indices (e.g. -1 being the last frame)
export const convertToPositiveFrameIndex = (
	frame: number,
	durationInFrames: number
) => {
	return frame < 0 ? durationInFrames - frame : frame;
};
