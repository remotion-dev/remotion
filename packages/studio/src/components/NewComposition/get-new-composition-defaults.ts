import type {VideoConfig} from 'remotion';

type CompositionDimensions = Pick<
	VideoConfig,
	'width' | 'height' | 'fps' | 'durationInFrames'
>;

const defaultCompositionDimensions: CompositionDimensions = {
	width: 1920,
	height: 1080,
	fps: 30,
	durationInFrames: 150,
};

const canvasCaptureFps = 60;

export const getNewCompositionDefaults = (
	composition: CompositionDimensions | null,
	canvasCaptureDurationInSeconds: number | null,
): CompositionDimensions => {
	if (canvasCaptureDurationInSeconds !== null) {
		return {
			...defaultCompositionDimensions,
			fps: canvasCaptureFps,
			durationInFrames: Math.max(
				1,
				Math.ceil(canvasCaptureDurationInSeconds * canvasCaptureFps),
			),
		};
	}

	return composition ?? defaultCompositionDimensions;
};
