import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {
	svgLayerFontIdentity,
	svgLayerFontModes,
} from './fixtures/svg-layer-font-identity';
import {captureNativeReference, countNativePixels} from './native-reference';

test.for(
	svgLayerFontModes.flatMap((mode) => [0, 1].map((frame) => ({mode, frame}))),
)('preserves layer identity $mode frame $frame', async ({mode, frame}, t) => {
	const composition = svgLayerFontIdentity({mode, literal: false});
	const control = svgLayerFontIdentity({mode, literal: true});
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
	expect((await countNativePixels(expected, actual)).mismatchedPixels).toBe(0);
	if (t.task.file.projectName === 'chromium')
		expect((await countNativePixels(reference, actual)).mismatchedPixels).toBe(
			0,
		);
});

test('invalidates the layer drawable for CSSOM-only font changes in a batch', async () => {
	const composition = svgLayerFontIdentity({mode: 'cache', literal: false});
	const options = {
		inputProps: {},
		licenseKey: 'free-license',
		allowHtmlInCanvas: false,
	} as const;
	const frames = await renderFramesOnWeb({
		...options,
		composition,
		frames: [0, 1],
	});
	const images: Blob[] = [];
	for (const frame of [0, 1]) {
		const batch = await frames[frame].blob({format: 'png'});
		images.push(batch);
		const fresh = await (
			await renderStillOnWeb({...options, composition, frame})
		).blob({format: 'png'});
		const expected = await (
			await renderStillOnWeb({
				...options,
				composition: svgLayerFontIdentity({mode: 'cache', literal: true}),
				frame,
			})
		).blob({format: 'png'});
		expect((await countNativePixels(expected, batch)).mismatchedPixels).toBe(0);
		expect((await countNativePixels(fresh, batch)).mismatchedPixels).toBe(0);
	}

	expect(
		(await countNativePixels(images[0], images[1])).mismatchedPixels,
	).toBeGreaterThan(0);
});
