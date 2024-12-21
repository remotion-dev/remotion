import {Dimensions} from '@remotion/media-parser';
import {ResizeOperation} from '@remotion/webcodecs';

export const getInitialResizeSuggestion = (
	rotatedDimensions: Dimensions,
): ResizeOperation => {
	const portrait = rotatedDimensions.height > rotatedDimensions.width;
	const qualitySteps = [2160, 1080, 720, 480, 360, 240, 144, 16];
	const options = qualitySteps.filter(
		(option) =>
			option < Math.min(rotatedDimensions.width, rotatedDimensions.height),
	);

	if (options.length === 0) {
		throw new Error('No valid resize options found');
	}

	if (portrait) {
		return {
			mode: 'max-width',
			maxWidth: options[0],
		};
	}

	return {
		mode: 'max-height',
		maxHeight: options[0],
	};
};
