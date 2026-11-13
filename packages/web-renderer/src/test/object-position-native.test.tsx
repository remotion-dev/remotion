import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {objectPositionMath} from './fixtures/object-position';
import '../symbol-dispose';
import {replacedElementPixelated} from './fixtures/replaced-element-pixelated';
import {
	createReplacedSamplerSibling,
	createSvgSamplerInvariant,
} from './fixtures/replaced-element-sampler-controls';
import {compareNativePixels} from './native-reference';
import {testCompositions} from './utils';

test('renders calculated object positions and pixelated images', async () => {
	await testCompositions({
		cases: [objectPositionMath, replacedElementPixelated].map(
			(composition) => ({composition, frame: 1}),
		),
		columns: 1,
		testId: 'object-position-math-and-pixelated',
	});
});

// KINO-7764: a pixelated replaced element must not change the next sibling sampler.
test('restores sampling before the next replaced element', async () => {
	const render = async (pixelated: boolean) =>
		(
			await renderStillOnWeb({
				composition: createReplacedSamplerSibling(pixelated),
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
	const result = await compareNativePixels(
		await render(false),
		await render(true),
	);
	expect(result.mismatchedPixels).toBe(0);
});

// PR #13110: vector sources ignore this raster sampler, including scaled SVG crops.
test('keeps vector SVG painting independent of the raster sampler', async () => {
	const render = async (pixelated: boolean) =>
		(
			await renderStillOnWeb({
				composition: createSvgSamplerInvariant(pixelated),
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
	const result = await compareNativePixels(
		await render(false),
		await render(true),
	);
	expect(result.mismatchedPixels).toBe(0);
});
