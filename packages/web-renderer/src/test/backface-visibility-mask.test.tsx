import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {backfaceVisibilityMask} from './fixtures/backface-visibility-mask';
import {testImage} from './utils';

test('should render backface-visibility with mask-image', async () => {
	await page.viewport(500, 200);
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: backfaceVisibilityMask,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob,
		testId: 'backface-visibility-mask',
		threshold: 0.04,
		allowedMismatchedPixelRatio: 0.015,
	});
});
