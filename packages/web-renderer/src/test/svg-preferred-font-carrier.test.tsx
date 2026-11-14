import {test} from 'vitest';
import '../symbol-dispose';
import {
	svgPreferredFontCarrier,
	svgPreferredFontModes,
} from './fixtures/svg-preferred-font-carrier';
import {testCompositions} from './utils';

test(
	'retains preferred fonts and authored stylesheet selectors',
	{timeout: 15_000},
	async () => {
		await testCompositions({
			scale: null,
			cases: svgPreferredFontModes.map((mode) => ({
				composition: svgPreferredFontCarrier({
					mode,
					literal: false,
					fallback: false,
				}),
				frame: 1,
			})),
			columns: 3,
			testId: 'svg-preferred-font-carriers',
		});
	},
);
