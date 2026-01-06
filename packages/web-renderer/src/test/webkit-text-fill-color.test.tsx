import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {webkitTextFillColor} from './fixtures/text/webkit-text-fill-color';
import {testImage} from './utils';

test('should render -webkit-text-fill-color', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: webkitTextFillColor,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'webkit-text-fill-color'});
});
