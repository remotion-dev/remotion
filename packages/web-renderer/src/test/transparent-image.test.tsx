import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {transparentImage} from './fixtures/transparent-image';
import {testImage} from './utils';

test('transparent image', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: transparentImage,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'transparent-image'});
});
