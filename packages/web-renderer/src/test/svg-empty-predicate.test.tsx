import {test} from 'vitest';
import '../symbol-dispose';
import {
	svgEmptyPredicate,
	svgEmptyPredicates,
} from './fixtures/svg-empty-predicate';
import {testCompositions} from './utils';

test('preserves empty stylesheet predicates', async () => {
	await testCompositions({
		cases: svgEmptyPredicates.map((_, index) => ({
			composition: svgEmptyPredicate({index, literal: false}),
			frame: 1,
		})),
		columns: 3,
		testId: 'svg-empty-predicates',
	});
});
