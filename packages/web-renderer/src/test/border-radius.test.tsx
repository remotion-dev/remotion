import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {borderRadius} from './fixtures/border-radius';
import {borderRadiusClamped} from './fixtures/border-radius-clamped';
import {borderRadiusDifferent} from './fixtures/border-radius-different';
import {borderRadiusElliptical} from './fixtures/border-radius-elliptical';
import {borderRadiusNone} from './fixtures/border-radius-none';
import {borderRadiusPercentage} from './fixtures/border-radius-percentage';
import {borderRadiusSimple} from './fixtures/border-radius-simple';
import {testImage} from './utils';

test('should apply a border radius', async () => {
	const blob = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadius,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'border-radius'});
});

test('should draw image with simple border radius', async () => {
	const blob = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadiusSimple,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-simple'});
});

test('should draw image with elliptical border radius', async () => {
	const blob = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadiusElliptical,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-elliptical'});
});

test('should draw image with different corner radii', async () => {
	const blob = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadiusDifferent,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-different'});
});

test('should draw image with percentage border radius', async () => {
	const blob = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadiusPercentage,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-percentage'});
});

test('should draw image with no border radius', async () => {
	const blob = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadiusNone,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-none'});
});

test('should clamp border radius that exceeds maximum', async () => {
	const blob = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadiusClamped,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-clamped'});
});
