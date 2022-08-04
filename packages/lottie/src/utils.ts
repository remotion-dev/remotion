export const getNextFrame = (
	currentFrame: number,
	totalFrames: number,
	loop?: boolean
) => {
	return loop
		? currentFrame % totalFrames
		: Math.min(currentFrame, totalFrames);
};
