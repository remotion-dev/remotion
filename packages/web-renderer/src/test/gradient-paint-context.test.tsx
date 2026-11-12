import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	gradientPaintContext,
	gradientPaintModes,
} from './fixtures/gradient-paint-context';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.for(
	gradientPaintModes.flatMap((mode) => [0, 1].map((frame) => ({mode, frame}))),
)(
	'retains native context behavior for $mode frame $frame',
	async ({mode, frame}) => {
		const composition = gradientPaintContext(mode);
		const native = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const actual = await (
			await renderStillOnWeb({
				composition,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const repeat = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});

		expect((await compareNativePixels(native, repeat)).mismatchedPixels).toBe(
			0,
		);
		expect((await compareNativePixels(native, actual)).mismatchedPixels).toBe(
			0,
		);
	},
);
