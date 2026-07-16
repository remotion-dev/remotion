import {expect, test} from 'vitest';
import {supportsNestedHtmlInCanvas} from '../html-in-canvas';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {threeDTransformOutOfBounds} from './fixtures/three-d-transform-out-of-bounds';
import {testImage} from './utils';

test('Should not render items that are out of bounds', async () => {
	const usesNativeHtmlInCanvas = await supportsNestedHtmlInCanvas();
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: threeDTransformOutOfBounds,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});
	const {internalState} = still;

	await testImage({
		blob,
		testId: 'three-d-transform-out-of-bounds',
		allowedMismatchedPixelRatio: 0.03,
	});

	if (usesNativeHtmlInCanvas) {
		expect(internalState.getDrawn3dPixels()).toBe(0);
		expect(internalState.getPrecomposedTiles()).toBe(0);
	} else {
		expect([10000, 11236]).toContain(internalState.getDrawn3dPixels());
		expect(internalState.getPrecomposedTiles()).toBe(1);
	}
});
