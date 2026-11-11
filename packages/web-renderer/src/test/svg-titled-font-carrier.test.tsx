import {createElement} from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {expect, test} from 'vitest';
import {page} from 'vitest/browser';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import {
	svgTitledFontMediaCache,
	svgTitledFontCarrier,
	svgTitledFontModes,
	svgTitledFontSources,
} from './fixtures/svg-titled-font-carrier';
import {captureNativeReference, compareNativePixels} from './native-reference';

const pixels = async (blob: Blob, top: number, height: number) => {
	const image = await createImageBitmap(blob);
	const canvas = new OffscreenCanvas(260, height);
	try {
		const context = canvas.getContext('2d')!;
		context.drawImage(image, 0, -top);
		return context.getImageData(0, 0, 260, height).data;
	} finally {
		image.close();
		canvas.width = 0;
		canvas.height = 0;
	}
};

test.for(
	svgTitledFontModes.flatMap((mode) =>
		svgTitledFontSources.flatMap((source) =>
			[0, 1].map((frame) => ({mode, source, frame})),
		),
	),
)(
	'preserves titled stylesheet font $mode $source frame $frame',
	async ({mode, source, frame}) => {
		const composition = svgTitledFontCarrier(mode, source, false, false);
		const literal = svgTitledFontCarrier(mode, source, true, false);
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
		const fallback = await render(
			svgTitledFontCarrier(mode, source, true, true),
		);
		expect(
			(await compareNativePixels(expected, fallback)).mismatchedPixels,
		).toBeGreaterThan(0);
		const expectedGlyphs = await pixels(expected, 0, 60);
		const fallbackGlyphs = await pixels(fallback, 0, 60);
		expect(
			expectedGlyphs.some((value, index) => index % 4 !== 3 && value !== 255),
		).toBe(true);
		expect(
			expectedGlyphs.some((value, index) => value !== fallbackGlyphs[index]),
		).toBe(true);
		const actual = await render(composition);
		if (
			mode === 'media-active' ||
			mode === 'media-inactive' ||
			mode === 'media-all-inactive'
		) {
			const actualMarker = await pixels(actual, 60, 30);
			const nativeMarker = await pixels(reference, 60, 30);
			expect(
				actualMarker.some((value, index) => value !== nativeMarker[index]),
			).toBe(false);
		}

		expect((await compareNativePixels(expected, actual)).mismatchedPixels).toBe(
			0,
		);
	},
);

test('invalidates titled font carrier cache when viewport media changes', async () => {
	await svgExternalFontReady;
	const viewport = {width: innerWidth, height: innerHeight};
	const host = document.createElement('div');
	Object.assign(host.style, {position: 'fixed', left: '-1000px', top: '0px'});
	document.body.appendChild(host);
	const root = createRoot(host);
	const composition = svgTitledFontMediaCache({active: null});
	flushSync(() => root.render(createElement(composition.component)));
	const svg = host.querySelector('svg')!;
	const source = new XMLSerializer().serializeToString(svg);
	const draw = async (element: SVGSVGElement) => {
		const canvas = new OffscreenCanvas(100, 60);
		try {
			canvas
				.getContext('2d')!
				.drawImage(await turnSvgIntoDrawable(element), 0, 0);
			return await canvas.convertToBlob({type: 'image/png'});
		} finally {
			canvas.width = 0;
			canvas.height = 0;
		}
	};

	try {
		for (const width of [800, 400, 800]) {
			await page.viewport(width, 720);
			const active = matchMedia('(min-width: 500px)').matches;
			expect(active).toBe(width >= 500);
			expect(new XMLSerializer().serializeToString(svg)).toBe(source);
			const actual = await draw(svg);
			const fresh = svg.cloneNode(true) as SVGSVGElement;
			host.appendChild(fresh);
			let expected: Blob;
			try {
				expected = await draw(fresh);
			} finally {
				fresh.remove();
			}

			const native = await captureNativeReference(composition, 0, {
				omitBackground: false,
			});
			const literal = await captureNativeReference(
				svgTitledFontMediaCache({active}),
				0,
				{omitBackground: false},
			);
			expect(
				(await compareNativePixels(native, literal)).mismatchedPixels,
			).toBe(0);
			expect(
				(await compareNativePixels(expected, actual)).mismatchedPixels,
			).toBe(0);
			expect((await compareNativePixels(native, actual)).mismatchedPixels).toBe(
				0,
			);
		}
	} finally {
		root.unmount();
		host.remove();
		await page.viewport(viewport.width, viewport.height);
	}
});
