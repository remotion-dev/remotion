import {test} from 'vitest';
import '../symbol-dispose';
import {svgCssDataFont} from './fixtures/svg-css-data-font';
import {svgCssUrlFont} from './fixtures/svg-css-url-font';
import {svgLocalFontOrder} from './fixtures/svg-local-font-order';
import {testCompositions} from './utils';

test('renders CSS font sources and local fallback order', async () => {
	await testCompositions({
		cases: [
			svgCssDataFont,
			svgCssUrlFont,
			svgLocalFontOrder({literal: false}),
		].map((composition) => ({composition, frame: 1})),
		columns: 2,
		testId: 'svg-css-font-sources-and-order',
		scale: null,
	});
});
