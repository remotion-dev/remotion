import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {backgroundClipText} from './fixtures/text/background-clip-text';
import {testImage} from './utils';

test('should render background-clip: text', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: backgroundClipText,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({
		blob,
		testId: 'background-clip-text',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.03,
	});
});

test('should render background-clip: text (scaled)', async () => {
	await page.viewport(800, 1400);
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: backgroundClipText,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
		scale: 2,
	});

	await testImage({
		blob,
		testId: 'background-clip-text-scaled',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.03,
	});
});
