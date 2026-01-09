import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {threeDFlattening} from './fixtures/clipped';
import {testImage} from './utils';

test('should not clip this example', async () => {
	await page.viewport(1080, 1080);
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: threeDFlattening,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: '3d-flattening'});
});
