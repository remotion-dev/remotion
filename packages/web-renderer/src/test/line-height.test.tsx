import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {lineHeight} from './fixtures/line-height';
import {testImage} from './utils';

test('should render text with line height', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: lineHeight,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'line-height', threshold: 0.02});
});
