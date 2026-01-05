import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {borderRadius} from './fixtures/border-radius';
import {borderRadiusClamped} from './fixtures/border-radius-clamped';
import {borderRadiusDifferent} from './fixtures/border-radius-different';
import {borderRadiusElliptical} from './fixtures/border-radius-elliptical';
import {borderRadiusNested} from './fixtures/border-radius-nested';
import {borderRadiusNestedOverflowHidden} from './fixtures/border-radius-nested-overflow-hidden';
import {borderRadiusNone} from './fixtures/border-radius-none';
import {borderRadiusPercentage} from './fixtures/border-radius-percentage';
import {borderRadiusSimple} from './fixtures/border-radius-simple';
import {testImage} from './utils';

test('should apply a border radius', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadius,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'border-radius'});
});

test('should draw image with simple border radius', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadiusSimple,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-simple'});
});

test('should draw image with elliptical border radius', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadiusElliptical,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-elliptical'});
});

test('should draw image with different corner radii', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadiusDifferent,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-different'});
});

test('should draw image with percentage border radius', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadiusPercentage,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-percentage'});
});

test('should draw image with no border radius', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadiusNone,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-none'});
});

test('should clamp border radius that exceeds maximum', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadiusClamped,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-clamped'});
});

test('should render nested border radii correctly', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadiusNested,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'border-radius-nested'});
});

test('should render nested border radii with overflow hidden', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderRadiusNestedOverflowHidden,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'border-radius-nested-overflow-hidden'});
});
