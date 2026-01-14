import {expect, test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {manyLayers} from './fixtures/many-layers';
import {testImage} from './utils';

test('should render many layers efficiently', async () => {
	page.viewport(1080, 1080);
	const {blob, internalState} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: manyLayers,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'many layers'});
	expect(internalState.getDrawn3dPixels()).toBeGreaterThanOrEqual(1338680);
	expect(internalState.getDrawn3dPixels()).toBeLessThanOrEqual(2450963);
	expect(internalState.getPrecomposedTiles()).toBeGreaterThanOrEqual(16);
	expect(internalState.getPrecomposedTiles()).toBeLessThanOrEqual(20);
});
