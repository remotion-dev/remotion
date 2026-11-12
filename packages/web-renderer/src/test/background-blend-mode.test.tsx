import {beforeAll, expect, test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {backgroundBlendMode} from './fixtures/background-blend-mode';
import {
	captureNativeReference,
	compareNativePixels,
	warmUpNativeReferences,
} from './native-reference';

beforeAll(async () => {
	if (!navigator.userAgent.includes('Chrome')) {
		return;
	}

	await warmUpNativeReferences([backgroundBlendMode]);
}, 60_000);

// KINO-7774: compare real browser painting, including alpha, without tolerance.
// One test per frame keeps each native capture and render within the timeout.
test.skipIf(!navigator.userAgent.includes('Chrome')).for([0, 1])(
	'blends backgrounds without blending descendants or the element backdrop at frame %i',
	async (frame) => {
		await page.viewport(backgroundBlendMode.width, backgroundBlendMode.height);
		const still = await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: backgroundBlendMode,
			frame,
			inputProps: {},
			allowHtmlInCanvas: false,
		});
		const reference = await captureNativeReference(backgroundBlendMode, frame);
		const result = await compareNativePixels(
			reference,
			await still.blob({format: 'png'}),
		);
		expect(result.mismatchedPixels).toBe(0);
	},
);
