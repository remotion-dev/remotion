import {expect, test} from 'vitest';
import {renderStillOnWeb, renderFramesOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	svgLocalFontOrder,
	svgLocalFontOrderModes,
} from './fixtures/svg-local-font-order';
import {compareNativePixels} from './native-reference';
import {testCompositions} from './utils';
test('preserves local font fallback order', async () => {
	await testCompositions({
		cases: svgLocalFontOrderModes.map((mode) => ({
			composition: svgLocalFontOrder({literal: false, mode, fallback: false}),
			frame: 1,
		})),
		columns: 3,
		testId: 'svg-local-font-order',
		scale: null,
	});
});

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
