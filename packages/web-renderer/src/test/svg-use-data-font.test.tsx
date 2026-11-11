import {expect, test} from 'vitest';
import '../symbol-dispose';
import {getSvgFontSnapshot} from '../drawing/turn-svg-into-drawable';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {
	svgUseDataFont,
	svgUseDataFontModes,
	svgUseFontData,
	svgUseFontFamilies,
} from './fixtures/svg-use-data-font';
import {captureNativeReference, compareNativePixels} from './native-reference';
const options = {
	inputProps: {},
	licenseKey: 'free-license',
	allowHtmlInCanvas: false,
} as const;
test.for(
	svgUseDataFontModes.flatMap((mode) => [0, 1].map((frame) => ({mode, frame}))),
)(
	'inherits data font through SVG use $mode frame $frame',
	async ({mode, frame}) => {
		const composition = svgUseDataFont(mode, false, false);
		const control = svgUseDataFont(mode, true, false);
		const reference = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const nativeControl = await captureNativeReference(control, frame, {
			omitBackground: false,
		});
		expect(
			(await compareNativePixels(reference, nativeControl)).mismatchedPixels,
		).toBe(0);
		const render = async (target: typeof composition) =>
			(await renderStillOnWeb({...options, composition: target, frame})).blob({
				format: 'png',
			});
		const expected = await render(control);
		const actual = await render(composition);
		const fallback = await render(svgUseDataFont(mode, true, true));
		expect(
			(await compareNativePixels(expected, fallback)).mismatchedPixels,
		).toBeGreaterThan(0);
		const image = await createImageBitmap(expected);
		const canvas = new OffscreenCanvas(260, 60);
		try {
			const context = canvas.getContext('2d')!;
			context.drawImage(image, 0, 0);
			expect(
				context
					.getImageData(0, 0, 260, 60)
					.data.some((value, index) => index % 4 !== 3 && value !== 255),
			).toBe(true);
		} finally {
			image.close();
			canvas.width = 0;
			canvas.height = 0;
		}

		expect((await compareNativePixels(expected, actual)).mismatchedPixels).toBe(
			0,
		);
	},
);
test('does not discover use-instance fonts without rendered template text', async () => {
	const urls = await svgUseFontData;
	const style = document.createElement('style');
	style.textContent = `@font-face{font-family:"${svgUseFontFamilies[0]}";src:url("${urls[0]}")}`;
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.innerHTML = `<defs><text>Unused label</text><g id="use-shape"><defs><text>Unrendered inner definition</text></defs><rect width="20" height="20"/></g></defs><use href="#use-shape" style="font-family:${svgUseFontFamilies[0]}"/>`;
	document.head.appendChild(style);
	document.body.appendChild(svg);
	try {
		expect(getSvgFontSnapshot(svg).cssFontRules).toBe('');
	} finally {
		svg.remove();
		style.remove();
	}
});
test('refreshes inherited use fonts in batch and fresh renders', async () => {
	const composition = svgUseDataFont('cache', false, false);
	const frames = await renderFramesOnWeb({
		...options,
		composition,
		frames: [0, 1, 2],
	});
	for (const frame of [0, 1, 2]) {
		const actual = await frames[frame].blob({format: 'png'});
		const fresh = await (
			await renderStillOnWeb({...options, composition, frame})
		).blob({format: 'png'});
		const literal = await (
			await renderStillOnWeb({
				...options,
				composition: svgUseDataFont('cache', true, false),
				frame,
			})
		).blob({format: 'png'});
		expect((await compareNativePixels(fresh, actual)).mismatchedPixels).toBe(0);
		expect((await compareNativePixels(literal, actual)).mismatchedPixels).toBe(
			0,
		);
	}
});
