import {test} from 'vitest';
import '../symbol-dispose';
import {
	maskGradientLayersUrl,
	maskGradientLayersBlob,
	maskGradientPaletteTransparent,
	maskGradientLayersTokenUrlTransparent,
} from './fixtures/mask-gradient-layers';
import {testCompositions} from './utils';

test.each([
	maskGradientLayersUrl,
	maskGradientLayersBlob,
	maskGradientPaletteTransparent,
	maskGradientLayersTokenUrlTransparent,
])('composes gradient mask operators for $id', async (composition) => {
	await testCompositions({
		cases: [{composition, frame: 1}],
		columns: 1,
		testId: composition.id,
		scale: null,
	});
});
