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
	svgInactiveTitleMediaCache,
	svgInactiveTitleModes,
	svgInactiveTitledFont,
} from './fixtures/svg-inactive-titled-font';
import {
	captureNativeReference,
	compareNativePixels,
	countNativePixels,
} from './native-reference';

const markers = async (blob: Blob) => {
	const bitmap = await createImageBitmap(blob);
	const canvas = new OffscreenCanvas(280, 40);
	try {
		canvas.getContext('2d')!.drawImage(bitmap, 0, 60, 280, 40, 0, 0, 280, 40);
		return await canvas.convertToBlob({type: 'image/png'});
	} finally {
		bitmap.close();
		canvas.width = 0;
		canvas.height = 0;
	}
};

test.for(
	svgInactiveTitleModes.flatMap((mode) =>
		[0, 1].map((frame) => ({mode, frame})),
	),
)(
	'retains titled font $mode at frame $frame',
	{timeout: 30000},
	async ({mode, frame}, t) => {
		const composition = svgInactiveTitledFont({
			mode,
			literal: false,
			fallback: false,
		});
		const control = svgInactiveTitledFont({
			mode,
			literal: true,
			fallback: false,
		});
		const reference = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const nativeControl = await captureNativeReference(control, frame, {
			omitBackground: false,
		});
		expect(
			(await countNativePixels(reference, nativeControl)).mismatchedPixels,
		).toBe(0);
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
		const fallback = await (
			await renderStillOnWeb({
				...options,
				composition: svgInactiveTitledFont({
					mode,
					literal: true,
					fallback: true,
				}),
			})
		).blob({format: 'png'});
		expect(
			(await countNativePixels(expected, fallback)).mismatchedPixels,
		).toBeGreaterThan(0);
		const glyphs = await createImageBitmap(expected);
		const canvas = new OffscreenCanvas(340, 60);
		try {
			const context = canvas.getContext('2d')!;
			context.drawImage(glyphs, 0, 0);
			expect(
				context
					.getImageData(0, 0, 340, 60)
					.data.some((value, index) => index % 4 !== 3 && value !== 255),
			).toBe(true);
		} finally {
			glyphs.close();
			canvas.width = 0;
			canvas.height = 0;
		}

		expect((await countNativePixels(expected, actual)).mismatchedPixels).toBe(
			0,
		);
		expect(
			(await countNativePixels(await markers(reference), await markers(actual)))
				.mismatchedPixels,
		).toBe(0);
		if (t.task.file.projectName === 'chromium')
			expect(
				(await countNativePixels(reference, actual)).mismatchedPixels,
			).toBe(0);
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

			const native = await captureNativeReference(composition, 0, {
				omitBackground: false,
			});
			const literal = await captureNativeReference(
				svgInactiveTitleMediaCache({active}),
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
