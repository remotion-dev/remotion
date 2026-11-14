import {NoReactInternals} from 'remotion/no-react';
import {expect, test, vi} from 'vitest';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	hiddenCssFontModes,
	svgHiddenCssFont,
} from './fixtures/svg-hidden-css-font';
import {compareNativePixels} from './native-reference';

test.for(
	hiddenCssFontModes.flatMap((mode) => [1].map((frame) => ({mode, frame}))),
)(
	'does not fetch fonts for display-none SVG $mode frame $frame',
	async ({mode, frame}) => {
		const composition = svgHiddenCssFont(mode, false);
		const literal = svgHiddenCssFont(mode, true);
		const fetchFont = vi
			.spyOn(NoReactInternals, 'fetchFontData')
			.mockRejectedValue(new Error('Hidden label font must not be fetched'));
		try {
			const actual = await (
				await renderStillOnWeb({
					composition,
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
			const reference = await (
				await renderStillOnWeb({
					composition: literal,
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
			expect(fetchFont).not.toHaveBeenCalled();
			expect(
				(await compareNativePixels(reference, actual)).mismatchedPixels,
			).toBe(0);
		} finally {
			fetchFont.mockRestore();
		}
	},
);

test('refreshes font discovery when an SVG ancestor becomes visible', async () => {
	const url = new URL('../../../example/public/bangers.woff2', import.meta.url)
		.href;
	const fontData = await (await fetch(url)).arrayBuffer();
	const style = document.createElement('style');
	style.textContent = `@font-face{font-family:"SVG display cache control";src:url("${url}") format("woff2")}`;
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('width', '160');
	svg.setAttribute('height', '60');
	svg.innerHTML =
		'<rect width="160" height="60" fill="white"/><g style="display:none"><text x="4" y="40" style="font-family:SVG display cache control;font-size:32px">Cache label</text></g>';
	document.head.appendChild(style);
	document.body.appendChild(svg);
	try {
		expect(
			(await document.fonts.load('32px "SVG display cache control"'))[0]
				?.status,
		).toBe('loaded');
		const fetchFont = vi
			.spyOn(NoReactInternals, 'fetchFontData')
			.mockResolvedValue(fontData);
		const canvas = new OffscreenCanvas(160, 60);
		const draw = async () => {
			canvas.getContext('2d')!.clearRect(0, 0, 160, 60);
			canvas.getContext('2d')!.drawImage(await turnSvgIntoDrawable(svg), 0, 0);
			return canvas.convertToBlob({type: 'image/png'});
		};

		try {
			const hidden = await draw();
			expect(fetchFont).not.toHaveBeenCalled();
			svg.querySelector('g')!.style.display = 'block';
			const visible = await draw();
			expect(fetchFont).toHaveBeenCalledTimes(1);
			expect(
				(await compareNativePixels(hidden, visible)).mismatchedPixels,
			).toBeGreaterThan(0);
			svg.querySelector('g')!.style.display = 'none';
			expect(
				(await compareNativePixels(hidden, await draw())).mismatchedPixels,
			).toBe(0);
			expect(fetchFont).toHaveBeenCalledTimes(1);
		} finally {
			fetchFont.mockRestore();
			canvas.width = 0;
		}
	} finally {
		svg.remove();
		style.remove();
	}
});
