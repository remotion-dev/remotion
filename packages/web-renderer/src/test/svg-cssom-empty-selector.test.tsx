import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {
	svgCssomEmptyModes,
	svgCssomEmptySelector,
} from './fixtures/svg-cssom-empty-selector';
import {compareNativePixels} from './native-reference';
import {testCompositions} from './utils';
const options = {
	inputProps: {},
	licenseKey: 'free-license',
	allowHtmlInCanvas: false,
} as const;
test('preserves CSSOM-only emptiness', async () => {
	await testCompositions({
		cases: svgCssomEmptyModes.map((mode) => ({
			composition: svgCssomEmptySelector(mode, false),
			frame: 1,
		})),
		columns: 3,
		testId: 'svg-cssom-empty-selectors',
		scale: null,
	});
});
test('retains CSSOM empty-selector changes across batch and fresh stills', async () => {
	const frames = await renderFramesOnWeb({
		...options,
		composition: svgCssomEmptySelector('cache', false),
		frames: [0, 1, 2],
	});
	for (const frame of [0, 1, 2]) {
		const actual = await frames[frame].blob({format: 'png'});
		const fresh = await (
			await renderStillOnWeb({
				...options,
				composition: svgCssomEmptySelector('cache', false),
				frame,
			})
		).blob({format: 'png'});
		const literal = await (
			await renderStillOnWeb({
				...options,
				composition: svgCssomEmptySelector('cache', true),
				frame,
			})
		).blob({format: 'png'});
		expect((await compareNativePixels(fresh, actual)).mismatchedPixels).toBe(0);
		expect((await compareNativePixels(literal, actual)).mismatchedPixels).toBe(
			0,
		);
	}
});
