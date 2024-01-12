import type {LottieProps} from './types';

type Params = Pick<LottieProps, 'direction' | 'loop'> & {
	currentFrame: number;
	totalFrames: number;
};

export const getLottieFrame = ({
	currentFrame,
	direction,
	loop,
	totalFrames,
}: Params) => {
	const nextFrame = loop
		? currentFrame % totalFrames
		: Math.min(currentFrame, totalFrames);

	if (direction === 'backward') {
		return totalFrames - nextFrame;
	}

	return nextFrame;
};
