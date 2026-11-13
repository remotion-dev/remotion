import {test} from 'vitest';
import '../symbol-dispose';
import {
	svgFontBeforeMutation,
	svgGroupedFontOrder,
	svgLocalFontGroups,
} from './fixtures/svg-font-order-mutation';
import {testCompositions} from './utils';

test('preserves SVG font order before temporary mutations', async () => {
	await testCompositions({
		cases: [
			svgFontBeforeMutation({literal: false}),
			...svgLocalFontGroups.map((group) =>
				svgGroupedFontOrder({group, literal: false}),
			),
		].map((composition) => ({composition, frame: 1})),
		columns: 3,
		testId: 'svg-font-order-and-mutation',
		scale: null,
	});
});
