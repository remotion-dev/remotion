import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {overflowHidden} from './fixtures/overflow-hidden';
import {overflowHidden3dTransform} from './fixtures/overflow-hidden-3d-transform';
import {overflowY} from './fixtures/overflow-y';
import {testImage} from './utils';

test('Should render overflow: hidden correctly', async () => {
	const {blob, internalState} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: overflowHidden,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({
		blob,
		testId: 'overflow-hidden',
		allowedMismatchedPixelRatio: 0.02,
	});

	expect(internalState.getDrawn3dPixels()).toBe(0);
	expect(internalState.getDrawn3dTextures()).toBe(0);
});

test('Should render overflow: hidden correctly with 3D transform', async () => {
	const {blob, internalState} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: overflowHidden3dTransform,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({
		blob,
		testId: 'overflow-hidden-3d-transform',
		allowedMismatchedPixelRatio: 0.02,
	});

	expect(internalState.getDrawn3dPixels()).toBe(22500);
	expect(internalState.getDrawn3dTextures()).toBe(1);
});

test('Should render overflowY: hidden correctly', async () => {
	// Unintuitive case, even though we clamp overflow on 1 axis, we still hide on both axes.
	// Adding a test to ensure we behave same as the browser.
	const {blob, internalState} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: overflowY,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({
		blob,
		testId: 'overflow-y',
	});

	expect(internalState.getDrawn3dPixels()).toBe(29142.13561756187);
	expect(internalState.getDrawn3dTextures()).toBe(1);
});
