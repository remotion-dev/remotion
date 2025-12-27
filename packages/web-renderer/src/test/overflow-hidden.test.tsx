import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {overflowHidden} from './fixtures/overflow-hidden';
import {overflowHidden3dTransform} from './fixtures/overflow-hidden-3d-transform';
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

	expect(internalState.getDrawn3dPixels()).toBe(200 * 200);
	expect(internalState.getDrawn3dTextures()).toBe(1);
});
