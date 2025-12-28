import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {opacityNested} from './fixtures/opacity-nested';
import {opacitySimple} from './fixtures/opacity-simple';
import {opacityZero} from './fixtures/opacity-zero';
import {threeDTransformOpacity} from './fixtures/three-d-transform-opacity';
import {testImage} from './utils';

test('should apply simple opacity', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: opacitySimple,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'opacity-simple', threshold: 0.02});
});

test('should apply nested opacity (multiply parent and child)', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: opacityNested,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'opacity-nested', threshold: 0.02});
});

test('should render with zero opacity (opacity: 0)', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: opacityZero,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'opacity-zero', threshold: 0.02});
});

test('should apply opacity with 3D transform (rotateX)', async () => {
	page.viewport(200, 200);
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: threeDTransformOpacity,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'three-d-transform-opacity', threshold: 0.02});
});
