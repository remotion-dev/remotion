import {expect, test} from 'bun:test';
import {cutPath} from '../cut-path';

test('Should be able to cut a simple path', () => {
	const result = cutPath('M 0 0 L 100 0', 50);
	expect(result).toBe('M 0 0 L 50 0');
});

test('Should return full path if length is greater than path length', () => {
	const result = cutPath('M 0 0 L 100 0', 200);
	expect(result).toBe('M 0 0 L 100 0');
});

test('Should handle zero length', () => {
	const result = cutPath('M 0 0 L 100 0', 0);
	expect(result).toBe('M 0 0');
});

test('Should handle complex path with curves', () => {
	const path = 'M 0 0 C 50 0 50 50 100 50';
	const result = cutPath(path, 50);
	// Result should be truncated curve
	expect(result).toMatch(/^M 0 0 C/);
	expect(result.length).toBeGreaterThan(0);
});
