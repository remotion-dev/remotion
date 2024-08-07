import {expect, test} from 'bun:test';
import {
	makeTransform,
	perspective,
	rotate,
	rotate3d,
	scale,
	skew,
	skewX,
	translate,
	translate3d,
	translateX,
	translateY,
	translateZ,
} from '../transformation-helpers/make-transform';

test('makeTransform() should work well - base case', () => {
	expect(makeTransform([scale(2), translateX(100)])).toEqual(
		'scale(2, 2) translateX(100px)',
	);
});

test('makeTransform() should work well - forgetting to pass a param', () => {
	// @ts-expect-error
	expect(() => makeTransform([scale(), translateX(100)])).toThrow(
		'Argument passed to "scale" for param "x" is undefined',
	);
});

test('makeTransform() should allow strings with units', () => {
	expect(makeTransform([rotate('12rad'), rotate3d(10, 20, 40, '12deg')])).toBe(
		'rotate(12rad) rotate3d(10, 20, 40, 12deg)',
	);
});

test('makeTransform() should handle skew', () => {
	expect(skew(10)).toBe('skew(10deg, 10deg)');
	expect(skew(10, 'rad')).toBe('skew(10rad, 10rad)');
	// @ts-expect-error
	expect(() => skew(10, 'rad', 1)).toThrow(/supports only the following /);
	expect(skewX(10, 'rad')).toBe('skewX(10rad)');
	expect(skewX('10rad')).toBe('skewX(10rad)');
});

test('makeTransform() should handle rotate', () => {
	expect(rotate(10)).toBe('rotate(10deg)');
	expect(rotate('10deg')).toBe('rotate(10deg)');
	expect(rotate(12, 'rad')).toBe('rotate(12rad)');
});

test('makeTransform() should handle translate', () => {
	expect(translate(10)).toBe('translate(10px)');
	expect(translate('12rem')).toBe('translate(12rem)');
	expect(translate(10, 10)).toBe('translate(10px, 10px)');
	expect(translate(10, '%')).toBe('translate(10%)');
	expect(translate(0, '%', 10, '%')).toBe('translate(0%, 10%)');
	expect(translate('10px', '30%')).toBe('translate(10px, 30%)');
	// @ts-expect-error
	expect(() => translate(0, '%', 10)).toThrow(
		/supports only the following signatures/,
	);
});

test('makeTransform() should handle translate3d', () => {
	expect(translate3d('12px', '12px', '10px')).toBe(
		'translate3d(12px, 12px, 10px)',
	);
	expect(translate3d(10, 0, 0)).toBe('translate3d(10px, 0px, 0px)');
	expect(translate3d(10, '%', 0, '%', 0, 'px')).toBe(
		'translate3d(10%, 0%, 0px)',
	);
});

test('makeTransform() should handle translations', () => {
	expect(translateX(10)).toBe('translateX(10px)');
	expect(translateX(10, '%')).toBe('translateX(10%)');
	expect(translateY(10)).toBe('translateY(10px)');
	expect(translateY(10, '%')).toBe('translateY(10%)');
	expect(translateZ(10, 'px')).toBe('translateZ(10px)');
	expect(translateZ('12px')).toBe('translateZ(12px)');
});

test('makeTransform() should handle perspective', () => {
	expect(perspective(100)).toBe('perspective(100px)');
});
