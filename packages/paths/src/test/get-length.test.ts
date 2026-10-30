import {expect, test} from 'bun:test';
import {getLength} from '../get-length';

test('Should be able to get length of a path', () => {
	expect(getLength('M 0 0 L 100 0')).toBe(100);
});

test('Should get length of T after a T that follows a non-quadratic command', () => {
	const expected = getLength('M 0 0 H 10 Q 10 0 20 10 Q 30 20 30 0');
	expect(getLength('M 0 0 H 10 T 20 10 T 30 0')).toBeCloseTo(expected);
	expect(getLength('M 100 100 H 110 T 120 110 T 130 100')).toBeCloseTo(
		expected,
	);
});

test('Should throw error if path is invalid', () => {
	expect(() => getLength('remotion')).toThrow(/Malformed path data/);
});
