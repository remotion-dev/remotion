import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {transformWithAllShorthands} from './fixtures/transforms/transform-with-all-shorthands';
import {transformWithMultiComponentScale} from './fixtures/transforms/transform-with-multi-component-scale';
import {transformWithRotate} from './fixtures/transforms/transform-with-rotate';
import {transformWithScale} from './fixtures/transforms/transform-with-scale';
import {transformWithTranslate} from './fixtures/transforms/transform-with-translate';
import {testImage} from './utils';

test('Should combine transform property with scale shorthand', async () => {
	await page.viewport(1080, 1080);

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: transformWithScale,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'transform-with-scale'});
});

test('Should support a scale shorthand with multiple components', async () => {
	await page.viewport(1080, 1080);

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: transformWithMultiComponentScale,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'transform-with-multi-component-scale'});
});

test('Should combine transform property with rotate shorthand', async () => {
	await page.viewport(1080, 1080);

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: transformWithRotate,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'transform-with-rotate'});
});

test('Should combine transform property with translate shorthand', async () => {
	await page.viewport(1080, 1080);

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: transformWithTranslate,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'transform-with-translate'});
});

test('Should combine transform property with all CSS transform shorthands', async () => {
	await page.viewport(1080, 1080);

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: transformWithAllShorthands,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'transform-with-all-shorthands'});
});
