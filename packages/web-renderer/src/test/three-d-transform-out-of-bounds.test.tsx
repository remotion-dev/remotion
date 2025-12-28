import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {threeDTransformOutOfBounds} from './fixtures/three-d-transform-out-of-bounds';
import {testImage} from './utils';

test('Should not render items that are out of bounds', async () => {
	const {blob, internalState} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: threeDTransformOutOfBounds,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({
		blob,
		testId: 'three-d-transform-out-of-bounds',
		allowedMismatchedPixelRatio: 0.03,
	});

	expect(internalState.getDrawn3dPixels()).toBe(9870);
	expect(internalState.getDrawn3dTextures()).toBe(1);
});
