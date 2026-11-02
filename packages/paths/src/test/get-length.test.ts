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

test('Should get length of an arc whose radii are too small', () => {
	// The radii get scaled up, so this is a half circle with a diameter of sqrt(3² + 19²)
	const halfCircle = (Math.PI * Math.sqrt(3 ** 2 + 19 ** 2)) / 2;
	expect(getLength('M 0 0 A 5 5 0 0 1 3 19')).toBeCloseTo(halfCircle, 2);
	expect(getLength('M 0 0 A 10 10 0 0 1 5 27')).toBeCloseTo(
		(Math.PI * Math.sqrt(5 ** 2 + 27 ** 2)) / 2,
		2,
	);
});

test('Should throw error if path is invalid', () => {
	expect(() => getLength('remotion')).toThrow(/Malformed path data/);
});
