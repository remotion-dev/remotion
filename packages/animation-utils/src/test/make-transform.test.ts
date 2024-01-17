import {expect, test} from 'vitest';
import {
	makeTransform,
	scale,
	translateX,
} from '../transformation-helpers/make-transform';

test('makeTransform() should work well - base case', () => {
	expect(makeTransform([scale(2), translateX(100)])).toEqual(
		'scale(2, 2) translateX(100px)',
	);
});

test('makeTransform() should work well - forgetting to pass a param', () => {
	// @ts-expect-error
	expect(() => makeTransform([scale(), translateX(100)])).throws(
		'Argument passed to "scale" for param "x" is undefined',
	);
});
