import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {opacityInherited} from './fixtures/opacity-inherited';
import {testImage} from './utils';

test('border radius and opacity should not conflict', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: opacityInherited,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'opacity-inherited', threshold: 0.01});
});
