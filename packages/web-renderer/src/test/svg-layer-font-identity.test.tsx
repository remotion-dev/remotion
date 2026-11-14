import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {
	svgLayerFontIdentity,
	svgLayerFontModes,
} from './fixtures/svg-layer-font-identity';
import {countNativePixels} from './native-reference';
import {testCompositions} from './utils';

test('preserves CSS layer font identity', async () => {
	await testCompositions({
		cases: svgLayerFontModes.map((mode) => ({
			composition: svgLayerFontIdentity({mode, literal: false}),
			frame: 1,
		})),
		columns: 3,
		testId: 'svg-layer-font-identity',
		scale: null,
	});
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
