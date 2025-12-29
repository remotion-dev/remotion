import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {maskImage} from './fixtures/mask-image';
import {testImage} from './utils';

test('should render mask-image', async () => {
	await page.viewport(700, 300);
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: maskImage,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'mask-image', threshold: 0.02});
});
