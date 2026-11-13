import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgPreferredFontCarrier,
	svgPreferredFontModes,
} from './fixtures/svg-preferred-font-carrier';
import {captureNativeReference, compareNativePixels} from './native-reference';
const marker = async (blob: Blob) => {
	const image = await createImageBitmap(blob);
	const canvas = new OffscreenCanvas(360, 60);
	try {
		canvas.getContext('2d')!.drawImage(image, 0, -60);
		return await canvas.convertToBlob({type: 'image/png'});
	} finally {
		image.close();
		canvas.width = 0;
		canvas.height = 0;
	}
};

test.for(
	svgPreferredFontModes.flatMap((mode) =>
		[0, 1].map((frame) => ({mode, frame})),
	),
)(
	'retains preferred font carrier $mode frame $frame',
	async ({mode, frame}, t) => {
		const composition = svgPreferredFontCarrier({
			mode,
			literal: false,
			fallback: false,
		});
		const literal = svgPreferredFontCarrier({
			mode,
			literal: true,
			fallback: false,
		});
		const reference = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const nativeLiteral = await captureNativeReference(literal, frame, {
			omitBackground: false,
		});
		expect(
			(await compareNativePixels(reference, nativeLiteral)).mismatchedPixels,
		).toBe(0);
		const options = {
			frame,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		} as const;
		const render = async (target: typeof composition) =>
			(await renderStillOnWeb({...options, composition: target})).blob({
				format: 'png',
			});
		const actual = await render(composition);
		const expected = await render(literal);
		const fallback = await render(
			svgPreferredFontCarrier({mode, literal: true, fallback: true}),
		);
		expect(
			(await compareNativePixels(expected, fallback)).mismatchedPixels,
		).toBeGreaterThan(0);
		const image = await createImageBitmap(expected);
		const canvas = new OffscreenCanvas(360, 60);
		try {
			const context = canvas.getContext('2d')!;
			context.drawImage(image, 0, 0);
			expect(
				context
					.getImageData(0, 0, 360, 60)
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
		expect(
			(await compareNativePixels(await marker(reference), await marker(actual)))
				.mismatchedPixels,
		).toBe(0);
		if (t.task.file.projectName === 'chromium')
			expect(
				(await compareNativePixels(reference, actual)).mismatchedPixels,
			).toBe(0);
	},
);
