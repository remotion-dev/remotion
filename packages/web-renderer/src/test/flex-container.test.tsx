import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {flexContainer} from './fixtures/flex-container';
import {testImage} from './utils';

test('the container should be the same as in rendering', async () => {
	page.viewport(400, 400);
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: flexContainer,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'flex-container'});
});
