import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {transformWithAllShorthands} from './fixtures/transforms/transform-with-all-shorthands';
import {transformWithRotate} from './fixtures/transforms/transform-with-rotate';
import {transformWithScale} from './fixtures/transforms/transform-with-scale';
import {transformWithTranslate} from './fixtures/transforms/transform-with-translate';
import {testImage} from './utils';

test('Should combine transform property with scale shorthand', async () => {
	await page.viewport(1080, 1080);

	const blob = await renderStillOnWeb({
		composition: transformWithScale,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'transform-with-scale'});
});

test('Should combine transform property with rotate shorthand', async () => {
	await page.viewport(1080, 1080);

	const blob = await renderStillOnWeb({
		composition: transformWithRotate,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'transform-with-rotate'});
});

test('Should combine transform property with translate shorthand', async () => {
	await page.viewport(1080, 1080);

	const blob = await renderStillOnWeb({
		composition: transformWithTranslate,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'transform-with-translate'});
});

test('Should combine transform property with all CSS transform shorthands', async () => {
	await page.viewport(1080, 1080);

	const blob = await renderStillOnWeb({
		composition: transformWithAllShorthands,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'transform-with-all-shorthands'});
});
