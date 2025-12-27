import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {opacityNested} from './fixtures/opacity-nested';
import {opacitySimple} from './fixtures/opacity-simple';
import {opacityZero} from './fixtures/opacity-zero';
import {testImage} from './utils';

test('should apply simple opacity', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: opacitySimple,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'opacity-simple'});
});

test('should apply nested opacity (multiply parent and child)', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: opacityNested,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'opacity-nested'});
});

test('should render with zero opacity (opacity: 0)', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: opacityZero,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'opacity-zero'});
});
