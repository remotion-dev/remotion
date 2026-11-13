import {createElement} from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {expect, test} from 'vitest';
import {page} from 'vitest/browser';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import '../symbol-dispose';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import {
	svgInactiveTitleMediaCache,
	svgInactiveTitleModes,
	svgInactiveTitledFont,
} from './fixtures/svg-inactive-titled-font';
import {countNativePixels} from './native-reference';
import {testCompositions} from './utils';

test(
	'retains fonts across titled stylesheet states',
	{timeout: 15_000},
	async () => {
		await testCompositions({
			cases: svgInactiveTitleModes.map((mode) => ({
				composition: svgInactiveTitledFont({
					mode,
					literal: false,
					fallback: false,
				}),
				frame: 1,
			})),
			columns: 3,
			testId: 'svg-inactive-titled-fonts',
		});
	},
);

test('invalidates the earlier titled font carrier cache when viewport media changes', async () => {
	await svgExternalFontReady;
	const viewport = {width: innerWidth, height: innerHeight};
	const host = document.createElement('div');
	Object.assign(host.style, {position: 'fixed', left: '-1000px', top: '0px'});
	document.body.appendChild(host);
	const root = createRoot(host);
	const composition = svgInactiveTitleMediaCache({active: null});
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

			expect((await countNativePixels(expected, actual)).mismatchedPixels).toBe(
				0,
			);
			const bitmap = await createImageBitmap(actual);
			try {
				const canvas = new OffscreenCanvas(100, 60);
				const context = canvas.getContext('2d')!;
				context.drawImage(bitmap, 0, 0);
				expect(Array.from(context.getImageData(20, 20, 1, 1).data)).toEqual(
					active ? [255, 0, 0, 255] : [0, 0, 255, 255],
				);
			} finally {
				bitmap.close();
			}
		}
	} finally {
		root.unmount();
		host.remove();
		await page.viewport(viewport.width, viewport.height);
	}
});
