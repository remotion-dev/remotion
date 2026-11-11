import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgPaintFontModes,
	svgPaintResourceFont,
} from './fixtures/svg-paint-resource-font';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.for(
	svgPaintFontModes.flatMap((mode) => [0, 1].map((frame) => ({mode, frame}))),
)('retains CSS fonts in SVG $mode frame $frame', async ({mode, frame}, t) => {
	const composition = svgPaintResourceFont(mode, false, false);
	const literal = svgPaintResourceFont(mode, true, false);
	const fallback = svgPaintResourceFont(mode, true, true);
	const reference = await captureNativeReference(composition, frame, {
		omitBackground: false,
	});
	const literalReference = await captureNativeReference(literal, frame, {
		omitBackground: false,
	});
	expect(
		(await compareNativePixels(reference, literalReference)).mismatchedPixels,
	).toBe(0);
	const render = async (target: typeof composition) =>
		(
			await renderStillOnWeb({
				composition: target,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
	const expected = await render(literal);
	expect(
		(await compareNativePixels(expected, await render(fallback)))
			.mismatchedPixels,
	).toBeGreaterThan(0);
	const actual = await render(composition);
	expect((await compareNativePixels(expected, actual)).mismatchedPixels).toBe(
		0,
	);
	if (t.task.file.projectName === 'chromium')
		expect(
			(await compareNativePixels(reference, actual)).mismatchedPixels,
		).toBe(0);
});
