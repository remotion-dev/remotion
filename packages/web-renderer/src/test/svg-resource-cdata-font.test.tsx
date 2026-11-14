import {test} from 'vitest';
import '../symbol-dispose';
import {
	svgResourceCdataFont,
	svgResourceCdataModes,
} from './fixtures/svg-resource-cdata-font';
import {testCompositions} from './utils';

test('preserves SVG resource and CDATA fonts', async () => {
	await testCompositions({
		cases: svgResourceCdataModes.map((mode) => ({
			composition: svgResourceCdataFont(mode, false, false),
			frame: 1,
		})),
		columns: 3,
		testId: 'svg-resource-cdata-fonts',
		scale: null,
	});
});
