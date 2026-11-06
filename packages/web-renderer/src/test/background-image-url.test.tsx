import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {backgroundImageUrl} from './fixtures/background-image-url';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';
import {testImage} from './utils';

test.skipIf(!navigator.userAgent.includes('Chrome')).each([0, 1])(
	'raster backgrounds match native frame%s',
	async (frame) => {
		const reference = await captureNativeReference(backgroundImageUrl, frame);
		const actual = await (
			await renderStillOnWeb({
				composition: backgroundImageUrl,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const result = await compareNativePixels(reference, actual);
		await savePixelEvidence(reference, `background-reference-${frame}`);
		await savePixelEvidence(actual, `background-actual-${frame}`);
		await savePixelEvidence(result.diff, `background-diff-${frame}`);
		expect(result.mismatchedPixels).toBe(0);
	},
);

test('renders raster URL background sizes and repeats', async () => {
	const blob = await (
		await renderStillOnWeb({
			composition: backgroundImageUrl,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		})
	).blob({format: 'png'});
	await testImage({
		blob,
		testId: 'background-image-url',
		threshold: 0,
		allowedMismatchedPixelRatio: 0,
	});
});
