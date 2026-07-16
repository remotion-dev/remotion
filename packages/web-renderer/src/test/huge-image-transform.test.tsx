import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {hugeImageTransform} from './fixtures/huge-image-transform';
import {testImage} from './utils';

test('should render huge image with scale and 3D transform', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: hugeImageTransform,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});
	const {internalState} = still;

	await testImage({blob, testId: 'huge-image-transform'});
	expect(internalState.getDrawn3dPixels()).toBe(272384);
	expect(internalState.getPrecomposedTiles()).toBe(1);
});
