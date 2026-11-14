import {expect, test} from 'vitest';
import {getSvgFontSnapshot} from '../drawing/turn-svg-into-drawable';
import '../symbol-dispose';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {
	svgUseDataFont,
	svgUseDataFontModes,
	svgUseFontData,
	svgUseFontFamilies,
} from './fixtures/svg-use-data-font';
import {compareNativePixels} from './native-reference';
import {testCompositions} from './utils';
const options = {
	inputProps: {},
	licenseKey: 'free-license',
	allowHtmlInCanvas: false,
} as const;
test('inherits data fonts through SVG use', async () => {
	await testCompositions({
		cases: svgUseDataFontModes.map((mode) => ({
			composition: svgUseDataFont(mode, false, false),
			frame: 1,
		})),
		columns: 3,
		testId: 'svg-use-data-fonts',
		scale: null,
	});
});

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
