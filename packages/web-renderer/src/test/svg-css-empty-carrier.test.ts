import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {svgCssEmptyCarrierFixture} from './fixtures/svg-css-empty-carrier';
import {captureNativeReference, compareNativePixels} from './native-reference';

const options = {
	inputProps: {},
	licenseKey: 'free-license',
	allowHtmlInCanvas: false,
} as const;

// The complete 20×20 marker tests native CSS structure, including every RGBA channel.
// Full exported frames are compared independently below; this marker check makes no glyph-parity claim.
const markerPixels = async (blob: Blob) => {
	const image = await createImageBitmap(blob);
	try {
		const canvas = new OffscreenCanvas(20, 20);
		const context = canvas.getContext('2d')!;
		context.drawImage(image, 0, 0);
		return context.getImageData(0, 0, 20, 20).data;
	} finally {
		image.close();
	}
};

test.for(
	[false, true].flatMap((registered) =>
		(registered
			? ([
					'empty',
					'disabled-empty',
					'malformed-comment',
					'malformed-final-comment',
				] as const)
			: ([
					'empty',
					'disabled-empty',
					'disabled-nonempty',
					'authored-root',
				] as const)
		).flatMap((mode) => [0, 1].map((frame) => ({mode, frame, registered}))),
	),
)(
	'preserves the SVG empty carrier $mode registered=$registered frame=$frame',
	async ({mode, frame, registered}, t) => {
		const fixture = svgCssEmptyCarrierFixture({
			mode,
			literal: false,
			registered,
		});
		const reference = await captureNativeReference(fixture, frame, {
			omitBackground: false,
		});
		const actual = await (
			await renderStillOnWeb({...options, composition: fixture, frame})
		).blob({format: 'png'});
		const literal = await (
			await renderStillOnWeb({
				...options,
				composition: svgCssEmptyCarrierFixture({
					mode,
					literal: true,
					registered,
				}),
				frame,
			})
		).blob({format: 'png'});
		expect((await compareNativePixels(literal, actual)).mismatchedPixels).toBe(
			0,
		);
		expect(await markerPixels(actual)).toEqual(await markerPixels(reference));
		// Firefox/WebKit native glyph differences remain a separately measured limitation.
		if (t.task.file.projectName === 'chromium')
			expect(
				(await compareNativePixels(reference, actual)).mismatchedPixels,
			).toBe(0);
	},
);

test.for([false, true])(
	'invalidates the SVG carrier cache when CSSOM rules change registered=%s',
	async (registered) => {
		const fixture = svgCssEmptyCarrierFixture({
			mode: 'cache',
			literal: false,
			registered,
		});
		const frames = await renderFramesOnWeb({
			...options,
			composition: fixture,
			frames: [0, 1, 2],
		});
		const differences = [];
		for (let frame = 0; frame < 3; frame++) {
			const batch = await frames[frame].blob({format: 'png'});
			const fresh = await (
				await renderStillOnWeb({...options, composition: fixture, frame})
			).blob({format: 'png'});
			differences.push(
				(await compareNativePixels(fresh, batch)).mismatchedPixels,
			);
		}

		// This checks cache consistency with fresh exports, including the existing conservative fallback at frame1.
		expect(differences).toEqual([0, 0, 0]);
	},
);
