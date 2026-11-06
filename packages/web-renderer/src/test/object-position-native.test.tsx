import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {objectPosition} from './fixtures/object-position';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';

// KINO-7764: Firefox/WebKit still differ in CSS-vs-canvas image resampling.
// This qualifies Chromium only; those engine gaps remain open, without tolerance.
test.skipIf(!navigator.userAgent.includes('Chrome')).each([0, 1])(
	'Chromium object-position matches native pixels at frame %s',
	async (frame) => {
		const reference = await captureNativeReference(objectPosition, frame);
		const actual = await (
			await renderStillOnWeb({
				composition: objectPosition,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const result = await compareNativePixels(reference, actual);
		await savePixelEvidence(reference, `object-position-reference-${frame}`);
		await savePixelEvidence(actual, `object-position-actual-${frame}`);
		await savePixelEvidence(result.diff, `object-position-diff-${frame}`);
		expect(result.mismatchedPixels).toBe(0);
	},
);
