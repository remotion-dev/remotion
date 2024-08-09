import {expect, test} from 'bun:test';
import {
	applyAspectRatios,
	getDisplayAspectRatio,
} from '../get-sample-aspect-ratio';

test('Should calculate sample aspect ratio', () => {
	const displayAspectRatio = getDisplayAspectRatio({
		sampleAspectRatio: {
			denominator: 177,
			numerator: 56,
		},
		nativeDimensions: {
			width: 1280,
			height: 720,
		},
	});

	expect(displayAspectRatio).toEqual({
		numerator: 896,
		denominator: 1593,
	});

	const applied = applyAspectRatios({
		dimensions: {
			width: 1280,
			height: 720,
		},
		sampleAspectRatio: {
			numerator: 56,
			denominator: 177,
		},
		displayAspectRatio: {
			numerator: 896,
			denominator: 1593,
		},
	});
	expect(applied).toEqual({
		width: 405,
		height: 720,
	});
});
