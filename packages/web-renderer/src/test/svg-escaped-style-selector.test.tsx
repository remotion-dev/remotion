import {test} from 'vitest';
import '../symbol-dispose';
import {
	escapedStyleSelectorModes,
	svgEscapedStyleSelector,
} from './fixtures/svg-escaped-style-selector';
import {testCompositions} from './utils';

test('preserves escaped SVG selectors', async () => {
	await testCompositions({
		cases: escapedStyleSelectorModes.map((mode) => ({
			composition: svgEscapedStyleSelector({mode, literal: false}),
			frame: 1,
		})),
		columns: 3,
		testId: 'svg-escaped-style-selectors',
	});
});
