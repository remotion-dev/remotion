import {expect, test} from 'vitest';
import {supportsNestedHtmlInCanvas} from '../html-in-canvas';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {hugeImageTransform} from './fixtures/huge-image-transform';
import {testImage} from './utils';

test('should render huge image with scale and 3D transform', async () => {
	const usesNativeHtmlInCanvas = await supportsNestedHtmlInCanvas();
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: hugeImageTransform,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});
	const {internalState} = still;

	await testImage({blob, testId: 'huge-image-transform'});
	if (usesNativeHtmlInCanvas) {
		expect(internalState.getDrawn3dPixels()).toBe(0);
		expect(internalState.getPrecomposedTiles()).toBe(0);
	} else {
		expect(internalState.getDrawn3dPixels()).toBe(272384);
		expect(internalState.getPrecomposedTiles()).toBe(1);
	}
});
