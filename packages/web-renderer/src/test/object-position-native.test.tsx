import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {objectPosition, objectPositionMath} from './fixtures/object-position';
import '../symbol-dispose';
import {replacedElementPixelated} from './fixtures/replaced-element-pixelated';
import {
	createReplacedSamplerSibling,
	createSvgSamplerInvariant,
} from './fixtures/replaced-element-sampler-controls';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';

// KINO-7764: the general object-position fixtures still differ in WebKit.
// The bounded integer pixelated fixture qualifies Chromium and WebKit.
test
	.skipIf(navigator.userAgent.includes('Firefox'))
	.for(
		[objectPosition, objectPositionMath, replacedElementPixelated].flatMap(
			(fixture) => [0, 1].map((frame) => ({fixture, frame})),
		),
	)(
	'$fixture.id matches native pixels at frame $frame',
	async ({fixture, frame}, t) => {
		if (
			!navigator.userAgent.includes('Chrome') &&
			fixture !== replacedElementPixelated
		) {
			t.skip();
			return;
		}

		const reference = await captureNativeReference(fixture, frame);
		const actual = await (
			await renderStillOnWeb({
				composition: fixture,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const result = await compareNativePixels(reference, actual);
		if (result.mismatchedPixels > 0) {
			await savePixelEvidence(reference, `${fixture.id}-reference-${frame}`);
			await savePixelEvidence(actual, `${fixture.id}-actual-${frame}`);
			await savePixelEvidence(result.diff, `${fixture.id}-diff-${frame}`);
		}

		expect(result.mismatchedPixels).toBe(0);
	},
);

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
