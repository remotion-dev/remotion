import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {pixelDensity} from './fixtures/pixel-density';

const getCenterPixel = async (blob: Blob) => {
	const image = document.createElement('img');
	const objectUrl = URL.createObjectURL(blob);
	image.src = objectUrl;
	await new Promise<void>((resolve, reject) => {
		image.onload = () => resolve();
		image.onerror = () => reject(new Error('Image failed to load'));
	});

	const canvas = document.createElement('canvas');
	canvas.width = image.naturalWidth;
	canvas.height = image.naturalHeight;
	const context = canvas.getContext('2d');

	if (!context) {
		URL.revokeObjectURL(objectUrl);
		throw new Error('Could not get canvas context');
	}

	context.drawImage(image, 0, 0);
	const pixel = context.getImageData(
		Math.floor(image.naturalWidth / 2),
		Math.floor(image.naturalHeight / 2),
		1,
		1,
	).data;
	URL.revokeObjectURL(objectUrl);

	return pixel;
};

test('usePixelDensity() returns the scale during web rendering', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: pixelDensity,
			frame: 0,
			inputProps: {},
			scale: 0.5,
		})
	).blob({format: 'png'});

	const pixel = await getCenterPixel(blob);

	expect(pixel[0]).toBe(50);
	expect(pixel[1]).toBe(0);
	expect(pixel[2]).toBe(0);
});
