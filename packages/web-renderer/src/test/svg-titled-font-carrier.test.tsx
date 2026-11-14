import {createElement} from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {expect, test} from 'vitest';
import {page} from 'vitest/browser';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import '../symbol-dispose';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import {
	svgTitledFontMediaCache,
	svgTitledFontCarrier,
	svgTitledFontModes,
	svgTitledFontSources,
} from './fixtures/svg-titled-font-carrier';
import {captureNativeReference, compareNativePixels} from './native-reference';
import {testCompositions} from './utils';

test('preserves titled stylesheet font carriers', async () => {
	await testCompositions({
		cases: svgTitledFontModes.flatMap((mode) =>
			svgTitledFontSources.map((source) => ({
				composition: svgTitledFontCarrier(mode, source, false, false),
				frame: 1,
			})),
		),
		columns: 3,
		testId: 'svg-titled-font-carriers',
		scale: null,
	});
});

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
