import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {letterSpacing} from './fixtures/text/letter-spacing';
import {paragraphs} from './fixtures/text/paragraphs';
import {textFixture} from './fixtures/text/text';
import {textTransform} from './fixtures/text/text-transform';
import {testImage} from './utils';

test('should render text', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: textFixture,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({
		blob,
		testId: 'text-fixture',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.09,
	});
});

test('should render paragraphs', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: paragraphs,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'paragraphs', threshold: 0.03});
});

test('should render text with letter spacing', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: letterSpacing,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({
		blob,
		testId: 'letter-spacing',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.01,
	});
});

test('should render text with text transform', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: textTransform,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({
		blob,
		testId: 'text-transform',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.01,
	});
});
