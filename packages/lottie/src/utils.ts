interface Params {
	currentFrame: number;
	direction?: number;
	loop?: boolean;
	totalFrames: number;
}

export const getNextFrame = ({
	currentFrame,
	direction,
	loop,
	totalFrames,
}: Params) => {
	const nextFrame = loop
		? currentFrame % totalFrames
		: Math.min(currentFrame, totalFrames);

	if (direction === -1) {
		return totalFrames - nextFrame;
	}

	return nextFrame;
};
