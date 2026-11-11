import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {
	svgCssomEmptyModes,
	svgCssomEmptySelector,
} from './fixtures/svg-cssom-empty-selector';
import {captureNativeReference, compareNativePixels} from './native-reference';
const options = {
	inputProps: {},
	licenseKey: 'free-license',
	allowHtmlInCanvas: false,
} as const;
test.for(
	svgCssomEmptyModes.flatMap((mode) => [0, 1].map((frame) => ({mode, frame}))),
)(
	'preserves CSSOM-only emptiness $mode frame $frame',
	async ({mode, frame}) => {
		const composition = svgCssomEmptySelector(mode, false);
		const control = svgCssomEmptySelector(mode, true);
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
			await renderStillOnWeb({...options, composition, frame})
		).blob({format: 'png'});
		const expected = await (
			await renderStillOnWeb({...options, composition: control, frame})
		).blob({format: 'png'});
		expect((await compareNativePixels(expected, actual)).mismatchedPixels).toBe(
			0,
		);
	},
);
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
