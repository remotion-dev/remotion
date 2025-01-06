import type {Dimensions} from '@remotion/media-parser';
import type {ResizeOperation} from '@remotion/webcodecs';

export const getInitialResizeSuggestion = (
	rotatedDimensions: Dimensions | null,
): ResizeOperation => {
	if (rotatedDimensions === null) {
		return {
			mode: 'scale',
			scale: 0.5,
		};
	}

	const smallerSide = Math.min(
		rotatedDimensions.width,
		rotatedDimensions.height,
	);
	const qualitySteps = [2160, 1080, 720, 480, 360, 240, 144, 16];
	const options = qualitySteps.filter((option) => option < smallerSide);

	if (options.length === 0) {
		throw new Error('No valid resize options found');
	}

	return {
		mode: 'scale',
		scale: options[0] / smallerSide,
	};
};
