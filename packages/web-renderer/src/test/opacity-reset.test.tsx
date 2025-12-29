import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {opacityReset} from './fixtures/opacity-reset';
import {testImage} from './utils';

test('should reset opacity', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: opacityReset,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'opacity-reset'});
});
