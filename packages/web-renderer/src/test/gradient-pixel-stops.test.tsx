import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	gradientPixelModes,
	gradientPixelStops,
} from './fixtures/gradient-pixel-stops';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.for(
	gradientPixelModes.flatMap((mode) => [0, 1].map((frame) => ({mode, frame}))),
)(
	'matches native pixel gradient stops for $mode frame $frame',
	async ({mode, frame}) => {
		const composition = gradientPixelStops(mode);
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

		expect((await compareNativePixels(native, actual)).mismatchedPixels).toBe(
			0,
		);
	},
);
