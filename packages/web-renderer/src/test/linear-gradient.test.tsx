import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {linearGradient} from './fixtures/linear-gradient';
import {testImage} from './utils';

test('should render linear-gradient', async () => {
	await page.viewport(700, 400);
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: linearGradient,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'linear-gradient', threshold: 0.02});
});
