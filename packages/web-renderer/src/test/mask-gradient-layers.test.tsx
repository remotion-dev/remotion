import {test} from 'vitest';
import '../symbol-dispose';
import {
	maskGradientLayersUrl,
	maskGradientLayersBlob,
	maskGradientPaletteTransparent,
	maskGradientLayersTokenUrlTransparent,
} from './fixtures/mask-gradient-layers';
import {testCompositions} from './utils';

test('composes gradient mask operators across raster sources and alpha', async () => {
	await testCompositions({
		cases: [
			maskGradientLayersUrl,
			maskGradientLayersBlob,
			maskGradientPaletteTransparent,
			maskGradientLayersTokenUrlTransparent,
		].map((composition) => ({composition, frame: 1})),
		columns: 2,
		testId: 'mask-gradient-layers',
		scale: null,
	});
});
