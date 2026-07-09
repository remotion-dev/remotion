import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {inlineScaleAfterOutline} from './fixtures/inline-scale-after-outline';
import {testImage} from './utils';

const getImageData = async (blob: Blob) => {
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
	URL.revokeObjectURL(objectUrl);

	if (!context) {
		throw new Error('Could not get canvas context');
	}

	context.drawImage(image, 0, 0);

	return context.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
};

const getBlueBounds = ({
	imageData,
	yStart,
	yEnd,
}: {
	imageData: ImageData;
	yStart: number;
	yEnd: number;
}) => {
	let left = Infinity;
	let right = -Infinity;
	let top = Infinity;
	let bottom = -Infinity;

	for (let y = yStart; y < yEnd; y++) {
		for (let x = 0; x < imageData.width; x++) {
			const index = (y * imageData.width + x) * 4;
			const red = imageData.data[index];
			const green = imageData.data[index + 1];
			const blue = imageData.data[index + 2];
			const alpha = imageData.data[index + 3];

			if (
				alpha > 200 &&
				red > 30 &&
				red < 100 &&
				green > 100 &&
				green < 170 &&
				blue > 180
			) {
				left = Math.min(left, x);
				right = Math.max(right, x);
				top = Math.min(top, y);
				bottom = Math.max(bottom, y);
			}
		}
	}

	if (!Number.isFinite(left)) {
		throw new Error('Could not find blue caption pixels');
	}

	return {bottom, left, right, top};
};

test('ignores scale on inline captions after outline and background disappear', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: inlineScaleAfterOutline,
			frame: 2,
			inputProps: {},
		})
	).blob({format: 'png'});

	const imageData = await getImageData(blob);
	const unscaled = getBlueBounds({imageData, yStart: 30, yEnd: 190});
	const withScale = getBlueBounds({imageData, yStart: 210, yEnd: 370});

	expect(Math.abs(withScale.left - unscaled.left)).toBeLessThanOrEqual(1);
	expect(Math.abs(withScale.right - unscaled.right)).toBeLessThanOrEqual(1);
	expect(withScale.right - withScale.left).toBe(unscaled.right - unscaled.left);

	await testImage({
		blob,
		testId: 'inline-scale-after-outline',
		allowedMismatchedPixelRatio: 0.02,
	});
});
