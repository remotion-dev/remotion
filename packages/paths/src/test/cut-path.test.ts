import {expect, test} from 'bun:test';
import {cutPath} from '../cut-path';
import {getLength} from '../get-length';
import {getPointAtLength} from '../get-point-at-length';
import {parsePath} from '../parse-path';

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

test('Should cut a cubic curve at the requested arc length', () => {
	const path = 'M 0 0 C 0 100 100 100 100 0';
	const result = cutPath(path, 50);
	expect(getLength(result)).toBeCloseTo(50, 0);
});

test('Should end a cut cubic curve at the point at the requested length', () => {
	const path = 'M 0 0 C 0 100 100 100 100 0';
	const result = parsePath(cutPath(path, 50));
	const endpoint = result[result.length - 1];
	const expected = getPointAtLength(path, 50);
	if (endpoint.type !== 'C' || !expected) {
		throw new Error('Expected a cubic endpoint and a point on the path');
	}

	expect(endpoint.x).toBeCloseTo(expected.x, 1);
	expect(endpoint.y).toBeCloseTo(expected.y, 1);
});

test('Should cut a cubic curve with coincident control points by arc length', () => {
	const result = parsePath(cutPath('M 0 0 C 0 0 0 0 100 0', 50));
	const endpoint = result[result.length - 1];
	if (endpoint.type !== 'C') {
		throw new Error('Expected a cubic endpoint');
	}

	expect(endpoint.x).toBeCloseTo(50, 1);
});
