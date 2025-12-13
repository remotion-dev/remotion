import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {textFixture} from './fixtures/text';
import {testImage} from './utils';

test('should render text', async () => {
	const blob = await renderStillOnWeb({
		composition: textFixture,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'text-fixture'});
});
