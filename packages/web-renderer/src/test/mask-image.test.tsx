import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
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

test('should render mask-image (scaled)', async () => {
	await page.viewport(1400, 600);
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: maskImage,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
		scale: 2,
	});

	await testImage({blob, testId: 'mask-image-scaled', threshold: 0.02});
});
