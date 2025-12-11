import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {displayNone} from './fixtures/display-none';
import {testImage} from './utils';

test('should not render the element', async () => {
	const blob = await renderStillOnWeb({
		composition: displayNone,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'display-none'});
});
