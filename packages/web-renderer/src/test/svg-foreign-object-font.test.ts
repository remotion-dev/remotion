import {NoReactInternals} from 'remotion/no-react';
import {expect, test} from 'vitest';
import '../symbol-dispose';
import {
	svgForeignObjectFont,
	svgForeignObjectFontReady,
} from './fixtures/svg-foreign-object-font';
import {testCompositions} from './utils';

test('preserves registered fonts inside SVG foreignObject HTML', async () => {
	await svgForeignObjectFontReady;
	expect(
		NoReactInternals.getRegisteredFontFaces().some(
			(font) => font.fontFamily === 'Foreign object registered font',
		),
	).toBe(true);
	await testCompositions({
		cases: [{composition: svgForeignObjectFont, frame: 1}],
		columns: 1,
		testId: 'svg-foreign-object-font',
		scale: null,
	});
});
