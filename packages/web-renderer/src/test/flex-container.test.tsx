import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {flexContainer} from './fixtures/flex-container';
import {testImage} from './utils';

test('the container should be the same as in rendering', async () => {
	page.viewport(1080, 1080);
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: flexContainer,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'flex-container'});
});
