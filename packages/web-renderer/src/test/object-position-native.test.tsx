import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {objectPosition, objectPositionMath} from './fixtures/object-position';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';

// KINO-7764: Firefox/WebKit still differ in CSS-vs-canvas image resampling.
// This qualifies Chromium only; those engine gaps remain open, without tolerance.
test
	.skipIf(!navigator.userAgent.includes('Chrome'))
	.each(
		[objectPosition, objectPositionMath].flatMap((fixture) =>
			[0, 1].map((frame) => ({fixture, frame})),
		),
	)(
	'Chromium $fixture.id matches native pixels at frame $frame',
	async ({fixture, frame}) => {
		const reference = await captureNativeReference(fixture, frame);
		const actual = await (
			await renderStillOnWeb({
				composition: fixture,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const result = await compareNativePixels(reference, actual);
		await savePixelEvidence(reference, `${fixture.id}-reference-${frame}`);
		await savePixelEvidence(actual, `${fixture.id}-actual-${frame}`);
		await savePixelEvidence(result.diff, `${fixture.id}-diff-${frame}`);
		expect(result.mismatchedPixels).toBe(0);
	},
);
