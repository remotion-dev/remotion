import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {backgroundColor} from './fixtures/background-color';
import {testImage} from './utils';

test('should apply a border radius', async () => {
	const blob = await renderStillOnWeb({
		composition: backgroundColor,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'background-color'});
});
