import {expect, test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {backgroundBlendMode} from './fixtures/background-blend-mode';
import {captureNativeReference, compareNativePixels} from './native-reference';

// KINO-7774: compare real browser painting, including alpha, without tolerance.
test.skipIf(!navigator.userAgent.includes('Chrome'))(
	'blends backgrounds without blending descendants or the element backdrop',
	async () => {
		await page.viewport(backgroundBlendMode.width, backgroundBlendMode.height);
		for (const frame of [0, 1]) {
			const still = await renderStillOnWeb({
				licenseKey: 'free-license',
				composition: backgroundBlendMode,
				frame,
				inputProps: {},
				allowHtmlInCanvas: false,
			});
			const reference = await captureNativeReference(
				backgroundBlendMode,
				frame,
			);
			const result = await compareNativePixels(
				reference,
				await still.blob({format: 'png'}),
			);
			expect(result.mismatchedPixels).toBe(0);
		}
	},
);
