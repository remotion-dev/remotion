import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb, renderFramesOnWeb} from '../render-still-on-web';
import {
	svgLocalFontOrder,
	svgLocalFontOrderModes,
} from './fixtures/svg-local-font-order';
import {captureNativeReference, compareNativePixels} from './native-reference';
test.for(
	svgLocalFontOrderModes.flatMap((mode) =>
		[0, 1].map((frame) => ({mode, frame})),
	),
)(
	'retains SVG local fallback face order at mode $mode frame $frame',
	async ({mode, frame}, t) => {
		const options = {
			frame,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		} as const;
		const composition = svgLocalFontOrder({
			literal: false,
			mode,
			fallback: false,
		});
		const control = svgLocalFontOrder({literal: true, mode, fallback: false});
		const reference = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const nativeControl = await captureNativeReference(control, frame, {
			omitBackground: false,
		});
		expect(
			(await compareNativePixels(reference, nativeControl)).mismatchedPixels,
		).toBe(0);
		const actual = await (
			await renderStillOnWeb({...options, composition})
		).blob({format: 'png'});
		const expected = await (
			await renderStillOnWeb({...options, composition: control})
		).blob({format: 'png'});
		const fallback = await (
			await renderStillOnWeb({
				...options,
				composition: svgLocalFontOrder({literal: true, mode, fallback: true}),
			})
		).blob({format: 'png'});
		expect(
			(await compareNativePixels(expected, fallback)).mismatchedPixels,
		).toBeGreaterThan(0);
		const image = await createImageBitmap(expected);
		const canvas = new OffscreenCanvas(380, 80);
		try {
			const context = canvas.getContext('2d')!;
			context.drawImage(image, 0, 0);
			expect(
				context
					.getImageData(0, 0, 380, 80)
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
		if (t.task.file.projectName === 'chromium') {
			expect(
				(await compareNativePixels(reference, actual)).mismatchedPixels,
			).toBe(0);
		}
	},
);

test('refreshes local multi-source face order in cached and fresh frames', async () => {
	const composition = svgLocalFontOrder({
		literal: false,
		mode: 'cache',
		fallback: false,
	});
	const options = {
		composition,
		inputProps: {},
		licenseKey: 'free-license',
		allowHtmlInCanvas: false,
	} as const;
	const frames = await renderFramesOnWeb({...options, frames: [0, 1, 2]});
	for (const frame of [0, 1, 2]) {
		const actual = await frames[frame].blob({format: 'png'});
		const fresh = await (
			await renderStillOnWeb({...options, frame})
		).blob({format: 'png'});
		const literal = await (
			await renderStillOnWeb({
				...options,
				frame,
				composition: svgLocalFontOrder({
					literal: true,
					mode: 'cache',
					fallback: false,
				}),
			})
		).blob({format: 'png'});
		expect((await compareNativePixels(actual, fresh)).mismatchedPixels).toBe(0);
		expect((await compareNativePixels(actual, literal)).mismatchedPixels).toBe(
			0,
		);
	}
});
