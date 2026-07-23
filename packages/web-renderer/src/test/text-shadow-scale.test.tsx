import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {withResolvers} from '../with-resolvers';
import {textShadowScale} from './fixtures/text/text-shadow-scale';

const decode = async (blob: Blob) => {
	const img = document.createElement('img');
	img.src = URL.createObjectURL(blob);

	const {promise, resolve, reject} = withResolvers<void>();
	img.onload = () => resolve();
	img.onerror = () => reject(new Error('Image failed to load'));
	await promise;

	const canvas = document.createElement('canvas');
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(img, 0, 0);
	return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const leftmostX = (
	img: ImageData,
	pred: (r: number, g: number, b: number, a: number) => boolean,
) => {
	for (let x = 0; x < img.width; x++) {
		for (let y = 0; y < img.height; y++) {
			const i = (y * img.width + x) * 4;
			if (
				pred(img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3])
			) {
				return x;
			}
		}
	}

	return -1;
};

const isBlack = (r: number, g: number, b: number, a: number) =>
	a > 200 && r < 60 && g < 60 && b < 60;
const isRed = (r: number, g: number, b: number, a: number) =>
	a > 200 && r > 180 && g < 80 && b < 80;

// The fixture draws a black glyph with a red shadow offset 60px to the right.
// Since the shadow is a copy of the glyph shifted by the offset, the gap
// between the leftmost red pixel and the leftmost black pixel equals the
// shadow's horizontal offset in output pixels.
const measureShadowOffset = (img: ImageData) =>
	leftmostX(img, isRed) - leftmostX(img, isBlack);

const render = async (scale: number) => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: textShadowScale,
			frame: 0,
			inputProps: {},
			scale,
		})
	).blob({format: 'png'});
	return decode(blob);
};

test('text-shadow offset scales with the export scale option', async () => {
	const offset1x = measureShadowOffset(await render(1));
	const offset3x = measureShadowOffset(await render(3));

	// Sanity: at 1x the offset is roughly the 60px the fixture specifies.
	expect(offset1x).toBeGreaterThan(45);
	expect(offset1x).toBeLessThan(75);

	// The shadow offset must scale with the export scale, like the glyph does.
	const ratio = offset3x / offset1x;
	expect(ratio).toBeGreaterThan(2.7);
	expect(ratio).toBeLessThan(3.3);
});
