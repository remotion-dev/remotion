import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {paragraphs} from './fixtures/text/paragraphs';
import {textFixture} from './fixtures/text/text';
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

test('should render paragraphs', async () => {
	const blob = await renderStillOnWeb({
		composition: paragraphs,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'paragraphs'});
});
