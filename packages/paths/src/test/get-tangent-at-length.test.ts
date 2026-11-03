import {expect, test} from 'bun:test';
import {NoReactInternals} from 'remotion/no-react';
import {getLength} from '../get-length';
import {getTangentAtLength} from '../get-tangent-at-length';

test('Should be able to get parts of a path', () => {
	const parts = getTangentAtLength('M 0 0 L 100 0', 50);

	expect(parts).toEqual({x: 1, y: 0});
});

test('Should point in the direction of travel on an arc in v5', () => {
	// Half circle from (0, 0) over (50, -50) to (100, 0)
	const path = 'M 0 0 A 50 50 0 0 1 100 0';
	const length = getLength(path);
	// v4 keeps the legacy reversed direction for arcs
	const sign = NoReactInternals.ENABLE_V5_BREAKING_CHANGES ? 1 : -1;

	const start = getTangentAtLength(path, 0);
	expect(start?.x).toBeCloseTo(0, 2);
	expect(start?.y).toBeCloseTo(-sign, 2);

	const middle = getTangentAtLength(path, length / 2);
	expect(middle?.x).toBeCloseTo(sign, 2);
	expect(middle?.y).toBeCloseTo(0, 2);

	const end = getTangentAtLength(path, length);
	expect(end?.x).toBeCloseTo(0, 2);
	expect(end?.y).toBeCloseTo(sign, 2);
});

test('Should return null if the length is longer than the path', () => {
	expect(getTangentAtLength('M 0 0 L 100 0', 100)).toEqual({x: 1, y: 0});
	expect(getTangentAtLength('M 0 0 L 100 0', 101)).toBeNull();
});
