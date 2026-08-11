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

export const getNewCompositionDefaults = (
	composition: CompositionDimensions | null,
): CompositionDimensions => {
	return composition ?? defaultCompositionDimensions;
};
