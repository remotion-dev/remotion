import {test} from 'vitest';
import '../symbol-dispose';
import {
	svgPaintFontModes,
	svgPaintResourceFont,
} from './fixtures/svg-paint-resource-font';
import {testCompositions} from './utils';

test('retains CSS fonts in SVG paint resources', async () => {
	await testCompositions({
		cases: svgPaintFontModes.map((mode) => ({
			composition: svgPaintResourceFont(mode, false, false),
			frame: 1,
		})),
		columns: 3,
		testId: 'svg-paint-resource-fonts',
		scale: null,
	});
});
