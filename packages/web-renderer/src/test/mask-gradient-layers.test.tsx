import {test} from 'vitest';
import '../symbol-dispose';
import {
	maskGradientLayers,
	maskGradientLayersTransparent,
	maskGradientLayersUrl,
	maskGradientLayersUrlTransparent,
	maskGradientLayersBlob,
	maskGradientLayersBlobTransparent,
	maskGradientPalette,
	maskGradientPaletteTransparent,
	maskGradientLayersTokenUrl,
	maskGradientLayersTokenUrlTransparent,
} from './fixtures/mask-gradient-layers';
import {testCompositions} from './utils';

test('composes gradient mask operators across raster sources and alpha', async () => {
	await testCompositions({
		cases: [
			maskGradientLayers,
			maskGradientLayersTransparent,
			maskGradientLayersUrl,
			maskGradientLayersUrlTransparent,
			maskGradientLayersBlob,
			maskGradientLayersBlobTransparent,
			maskGradientPalette,
			maskGradientPaletteTransparent,
			maskGradientLayersTokenUrl,
			maskGradientLayersTokenUrlTransparent,
		].map((composition) => ({composition, frame: 1})),
		columns: 2,
		testId: 'mask-gradient-layers',
		scale: null,
	});
});
