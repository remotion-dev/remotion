import {expect, test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {stackingContextSiblings} from './fixtures/stacking-context-siblings';
import {captureNativeReference, compareNativePixels} from './native-reference';
import {testImage} from './utils';

test('orders atomic stacking-context siblings', async () => {
	await page.viewport(
		stackingContextSiblings.width,
		stackingContextSiblings.height,
	);
	for (const frame of [0, 1]) {
		const still = await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: stackingContextSiblings,
			frame,
			inputProps: {},
			allowHtmlInCanvas: false,
		});
		const blob = await still.blob();
		if (navigator.userAgent.includes('Chrome')) {
			const result = await compareNativePixels(
				await captureNativeReference(stackingContextSiblings, frame),
				blob,
			);
			expect(result.mismatchedPixels).toBe(0);
		}

		await testImage({
			blob,
			testId: `stacking-context-siblings-${frame}`,
			threshold: 0,
			allowedMismatchedPixelRatio: 0,
		});
	}
});
