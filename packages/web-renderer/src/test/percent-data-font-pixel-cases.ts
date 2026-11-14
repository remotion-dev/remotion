import {test} from 'vitest';
import '../symbol-dispose';
import {
	svgPercentDataFont,
	svgPercentDataFontEncodings,
} from './fixtures/svg-percent-data-font';
import {testCompositions} from './utils';

export const registerPercentDataFontPixelCases = (
	preferredTitle: 'A' | 'B',
) => {
	test(`preserves encoded fonts in preferred title ${preferredTitle}`, async () => {
		await testCompositions({
			cases: svgPercentDataFontEncodings.map((encoding) => ({
				composition: svgPercentDataFont(encoding, preferredTitle, null, false),
				frame: 1,
			})),
			columns: 3,
			testId: `svg-percent-data-font-${preferredTitle}`,
			scale: null,
		});
	});
};
