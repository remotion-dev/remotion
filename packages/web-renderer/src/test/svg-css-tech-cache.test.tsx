import {expect, test, vi} from 'vitest';
import '../symbol-dispose';
import {
	getSvgFontSnapshot,
	turnSvgIntoDrawable,
} from '../drawing/turn-svg-into-drawable';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgCssTechFont,
	svgCssTechFontReady,
	svgFontTechModes,
} from './fixtures/svg-css-tech-font';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import {captureNativeReference, countNativePixels} from './native-reference';

test('serializes registered font bytes only when rebuilding an SVG drawable', async () => {
	await svgExternalFontReady;
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('width', '160');
	svg.setAttribute('height', '60');
	svg.innerHTML =
		'<text x="4" y="40" style="font-family:&quot;External SVG, class font&quot;;font-size:32px">Cached</text>';
	document.body.appendChild(svg);
	const serialize = XMLSerializer.prototype.serializeToString;
	const embedded: number[] = [];
	const spy = vi
		.spyOn(XMLSerializer.prototype, 'serializeToString')
		.mockImplementation(function (this: XMLSerializer, node) {
			const markup = serialize.call(this, node);
			if (markup.includes('base64,')) embedded.push(markup.length);
			return markup;
		});
	try {
		const initial = await turnSvgIntoDrawable(svg);
		expect(embedded).toHaveLength(1);
		expect(await turnSvgIntoDrawable(svg)).toBe(initial);
		expect(embedded).toHaveLength(1);
		svg.querySelector('text')!.textContent = 'Changed';
		expect(await turnSvgIntoDrawable(svg)).not.toBe(initial);
		expect(embedded).toHaveLength(2);
	} finally {
		spy.mockRestore();
		svg.remove();
	}
});

test.for(
	svgFontTechModes.flatMap((mode) => [0, 1].map((frame) => ({mode, frame}))),
)(
	'retains CSS source technology $mode at frame $frame',
	async ({mode, frame}, t) => {
		await svgCssTechFontReady;
		const composition = svgCssTechFont({mode, literal: null});
		const control = svgCssTechFont({mode, literal: 'self-contained'});
		const options = {
			frame,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		} as const;
		const actual = await (
			await renderStillOnWeb({...options, composition})
		).blob({format: 'png'});
		const expected = await (
			await renderStillOnWeb({...options, composition: control})
		).blob({format: 'png'});
		expect((await countNativePixels(expected, actual)).mismatchedPixels).toBe(
			0,
		);
		if (mode !== 'color-colrv1' || CSS.supports('font-tech(color-COLRv1)')) {
			const fallback = await (
				await renderStillOnWeb({
					...options,
					composition: svgCssTechFont({mode, literal: 'fallback'}),
				})
			).blob({format: 'png'});
			expect(
				(await countNativePixels(expected, fallback)).mismatchedPixels,
			).toBeGreaterThan(0);
		}

		if (t.task.file.projectName === 'chromium') {
			const native = await captureNativeReference(composition, frame, {
				omitBackground: false,
			});
			expect((await countNativePixels(native, actual)).mismatchedPixels).toBe(
				0,
			);
		}
	},
);

test.for(['local', 'multiple', 'network'])(
	'does not admit $0 fallback sources through tech support',
	async (mode) => {
		const data = await svgCssTechFontReady;
		const src =
			mode === 'local'
				? `local("Arial"),url("${data}") format("woff2") tech(variations)`
				: mode === 'multiple'
					? `url("${data}") tech(variations),url("${data}")`
					: 'url("https://example.invalid/font.woff2") format("woff2") tech(variations)';
		const style = document.createElement('style');
		style.textContent = `@font-face{font-family:"SVG rejected ${mode}";src:${src}}`;
		document.head.appendChild(style);
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.innerHTML = `<text style='font-family:"SVG rejected ${mode}"'>Guard</text>`;
		document.body.appendChild(svg);
		try {
			expect(getSvgFontSnapshot(svg).cssFontRules).toBe('');
		} finally {
			svg.remove();
			style.remove();
		}
	},
);
