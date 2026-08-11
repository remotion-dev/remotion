import {expect, test} from 'bun:test';
import {getScaledImageThumbnailDimensions} from '../image-thumbnail/get-scaled-image-thumbnail-dimensions';

test('Should scale image thumbnails to the canvas height', () => {
	expect(
		getScaledImageThumbnailDimensions({
			naturalWidth: 1920,
			naturalHeight: 1080,
			canvasHeight: 50,
		}),
	).toEqual({
		scaledWidth: 88.88888888888889,
		scaledHeight: 50,
	});
});

test('Should return zero dimensions for empty images', () => {
	expect(
		getScaledImageThumbnailDimensions({
			naturalWidth: 0,
			naturalHeight: 0,
			canvasHeight: 50,
		}),
	).toEqual({
		scaledWidth: 0,
		scaledHeight: 0,
	});
});
