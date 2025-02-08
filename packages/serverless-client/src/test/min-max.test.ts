import {describe, expect, test} from 'bun:test';
import {max, min} from '../min-max';
describe('min() and max()', () => {
	test('Implemented min() functions correctly', () => {
		expect(min([0, -30, 90, -120, 0])).toBe(-120);
	});
	test('Implemented max() functions correctly', () => {
		expect(max([0, -30, 90, -120, 0])).toBe(90);
	});

	test('min() should throw on empty arr', () => {
		expect(() => min([])).toThrow(/Array of 0 length/);
	});
	test('max() should throw on empty arr', () => {
		expect(() => min([])).toThrow(/Array of 0 length/);
	});

	const bigArray = new Array(300000).fill(true).map((_, i) => {
		return i;
	});

	test('Custom max() should not throw', () => {
		expect(max(bigArray)).toBe(299999);
	});
});
