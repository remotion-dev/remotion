import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {outline} from './fixtures/outline';
import {testImage} from './utils';

test('should render outline', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: outline,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'outline'});
});
