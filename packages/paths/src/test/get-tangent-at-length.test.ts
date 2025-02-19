import {expect, test} from 'bun:test';
import {getTangentAtLength} from '../get-tangent-at-length';

test('Should be able to get parts of a path', () => {
	const parts = getTangentAtLength('M 0 0 L 100 0', 50);

	expect(parts).toEqual({x: 1, y: 0});
});
