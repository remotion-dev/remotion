import {type LoopVolumeCurveBehavior} from 'remotion';

export const frameForVolumeProp = ({
	behavior,
	loop,
	assetDurationInSeconds,
	fps,
	frame,
	startsAt,
}: {
	behavior: LoopVolumeCurveBehavior;
	loop: boolean;
	assetDurationInSeconds: number;
	fps: number;
	frame: number;
	startsAt: number;
}) => {
	if (!loop) {
		return frame + startsAt;
	}

	if (behavior === 'extend') {
		return frame + startsAt;
	}

	const assetDurationInFrames =
		Math.floor(assetDurationInSeconds * fps) - startsAt;

	return (frame % assetDurationInFrames) + startsAt;
};
