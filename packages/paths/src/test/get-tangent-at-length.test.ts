import {expect, test} from 'bun:test';
import {getTangentAtLength} from '../get-tangent-at-length';

test('Should be able to get parts of a path', () => {
	const parts = getTangentAtLength('M 0 0 L 100 0', 50);

	expect(parts).toEqual({x: 1, y: 0});
});

test('Should return null if the length is longer than the path', () => {
	expect(getTangentAtLength('M 0 0 L 100 0', 100)).toEqual({x: 1, y: 0});
	expect(getTangentAtLength('M 0 0 L 100 0', 101)).toBeNull();
});
