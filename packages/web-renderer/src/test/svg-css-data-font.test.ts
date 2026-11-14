import {test} from 'vitest';
import '../symbol-dispose';
import {svgCssConditionalFont} from './fixtures/svg-css-conditional-font';
import {svgCssDataFont} from './fixtures/svg-css-data-font';
import {svgCssUrlFont} from './fixtures/svg-css-url-font';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import {svgFontReviewCarrier} from './fixtures/svg-font-review-carrier';
import {
	svgLocalConditionalFont,
	svgLocalConditionalUrlFont,
	svgLocalConditionalFontReady,
} from './fixtures/svg-local-conditional-font';
import {testCompositions} from './utils';

test('renders CSS font sources, active conditions and EOF comment carriers', async () => {
	await Promise.all([svgExternalFontReady, svgLocalConditionalFontReady]);
	await testCompositions({
		cases: [
			svgCssDataFont,
			svgCssUrlFont,
			svgCssConditionalFont,
			svgLocalConditionalFont,
			svgLocalConditionalUrlFont,
			svgFontReviewCarrier({literal: false}),
		].map((composition) => ({composition, frame: 1})),
		columns: 2,
		testId: 'svg-css-font-sources-and-conditions',
		scale: null,
	});
});
