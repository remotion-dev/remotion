import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {manyLayers} from './fixtures/many-layers';
import {testImage} from './utils';

test('should render many layers efficiently', async () => {
	page.viewport(1080, 1080);
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: manyLayers,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
		logLevel: 'trace',
	});

	await testImage({blob, testId: 'many layers'});
});
