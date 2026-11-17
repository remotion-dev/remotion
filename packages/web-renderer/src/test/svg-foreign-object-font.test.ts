import {test} from 'vitest';
import '../symbol-dispose';
import {
	svgForeignObjectFont,
	svgForeignObjectFontReady,
} from './fixtures/svg-foreign-object-font';
import {testCompositions} from './utils';

test('preserves registered fonts inside SVG foreignObject HTML', async () => {
	await svgForeignObjectFontReady;
	await testCompositions({
		cases: [{composition: svgForeignObjectFont, frame: 1}],
		columns: 1,
		testId: 'svg-foreign-object-font',
		scale: null,
	});
});
