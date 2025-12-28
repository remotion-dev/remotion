import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {boxShadow} from './fixtures/box-shadow';
import {testImage} from './utils';

test('should render box-shadow', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: boxShadow,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'box-shadow', threshold: 0.01});
});
