import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	gradientMaskPixelModes,
	gradientMaskPixelStops,
} from './fixtures/gradient-mask-pixel-stops';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.for(
	gradientMaskPixelModes.flatMap((mode) =>
		[1, 2, 1.5].flatMap((scale) =>
			[0, 1].map((frame) => ({mode, scale, frame})),
		),
	),
)(
	'keeps native mask pixel stops for $mode scale $scale frame $frame',
	async ({mode, scale, frame}) => {
		// Native DOM is painted at the export's physical size, independently of
		// the DOM composer's mask coordinate conversion.
		const reference = gradientMaskPixelStops(mode, scale);
		const native = await captureNativeReference(reference, frame, {
			omitBackground: false,
		});
		const repeat = await captureNativeReference(reference, frame, {
			omitBackground: false,
		});
		const actual = await (
			await renderStillOnWeb({
				composition: gradientMaskPixelStops(mode, null),
				frame,
				scale,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		for (const comparison of [
			await compareNativePixels(native, repeat),
			await compareNativePixels(native, actual),
		]) {
			expect(comparison.mismatchedPixels).toBe(0);
			expect(comparison.maxChannelDelta).toBe(0);
		}
	},
);
