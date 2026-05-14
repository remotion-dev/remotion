import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {overflowHidden} from './fixtures/overflow-hidden';
import {overflowHidden3dTransform} from './fixtures/overflow-hidden-3d-transform';
import {testImage} from './utils';

test('Should render overflow: hidden correctly', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: overflowHidden,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});
	const {internalState} = still;

	await testImage({
		blob,
		testId: 'overflow-hidden',
		allowedMismatchedPixelRatio: 0.02,
	});

	expect(internalState.getDrawn3dPixels()).toBe(0);
	expect(internalState.getPrecomposedTiles()).toBe(0);
});

test('Should render overflow: hidden correctly with 3D transform', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: overflowHidden3dTransform,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});
	const {internalState} = still;

	await testImage({
		blob,
		testId: 'overflow-hidden-3d-transform',
		allowedMismatchedPixelRatio: 0.02,
	});

	expect([10000, 11236]).toContain(internalState.getDrawn3dPixels());
	expect(internalState.getPrecomposedTiles()).toBe(1);
});
