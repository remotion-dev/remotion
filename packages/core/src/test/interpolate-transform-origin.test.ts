import {expect, test} from 'bun:test';
import {
	interpolateTransformOrigin,
	normalizeTransformOrigin,
} from '../interpolate-transform-origin';

test('normalizes transform-origin keywords', () => {
	expect(normalizeTransformOrigin('left top')).toBe('0% 0%');
	expect(normalizeTransformOrigin('top left')).toBe('0% 0%');
	expect(normalizeTransformOrigin('right bottom')).toBe('100% 100%');
	expect(normalizeTransformOrigin('center bottom')).toBe('50% 100%');
	expect(normalizeTransformOrigin('left')).toBe('0% 50%');
	expect(normalizeTransformOrigin('top')).toBe('50% 0%');
	expect(normalizeTransformOrigin('30px')).toBe('30px 50%');
});

test('interpolates transform-origin percentages and keywords', () => {
	expect(
		interpolateTransformOrigin(0.5, [0, 1], ['left top', 'right bottom']),
	).toBe('50% 50%');
});

test('interpolates transform-origin lengths', () => {
	expect(
		interpolateTransformOrigin(0.5, [0, 1], ['0px 20px', '100px 40px']),
	).toBe('50px 30px');
});

test('interpolates transform-origin z from the default 0 length', () => {
	expect(
		interpolateTransformOrigin(0.5, [0, 1], ['50% 50%', '50% 50% 10px']),
	).toBe('50% 50% 5px');
});

test('rejects transform-origin unit mismatches', () => {
	expect(() =>
		interpolateTransformOrigin(0.5, [0, 1], ['left top', '100px 40px']),
	).toThrow(/different units on axis 1/);
});

test('rejects invalid transform-origin values', () => {
	expect(() => normalizeTransformOrigin('left right')).toThrow(
		/two horizontal keywords/,
	);
	expect(() => normalizeTransformOrigin('left top 10%')).toThrow(
		/z component must be a length/,
	);
	expect(() => normalizeTransformOrigin('top left 10px')).toThrow(
		/x position before the y position/,
	);
	expect(() => normalizeTransformOrigin('left top 10px extra')).toThrow(
		/1 to 3 components/,
	);
});
