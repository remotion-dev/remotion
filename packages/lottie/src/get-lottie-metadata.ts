import type {LottieAnimationData} from './types';

type LottieMetadata = {
	fps: number;
	durationInSeconds: number;
	durationInFrames: number;
	width: number;
	height: number;
};

export const getLottieMetadata = (
	animationData: LottieAnimationData
): LottieMetadata | null => {
	const width = animationData.w;
	const height = animationData.h;
	const framerate = animationData.fr;
	const durationInFrames = animationData.op;

	if (![width, height, framerate, durationInFrames].every(Boolean)) {
		return null;
	}

	return {
		durationInFrames: Math.floor(durationInFrames),
		durationInSeconds: durationInFrames / framerate,
		fps: framerate,
		height,
		width,
	};
};
