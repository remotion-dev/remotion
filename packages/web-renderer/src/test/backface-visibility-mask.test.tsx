import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {backfaceVisibilityMask} from './fixtures/backface-visibility-mask';
import {testImage} from './utils';

test('should render backface-visibility with mask-image', async () => {
	await page.viewport(500, 200);
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: backfaceVisibilityMask,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'backface-visibility-mask', threshold: 0.03});
});
