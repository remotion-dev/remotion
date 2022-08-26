import {expect, test} from 'vitest';
import {getPointAtLength} from '../get-point-at-length';

test('Should be able to get parts of a path', () => {
	const parts = getPointAtLength('M 0 0 L 100 0', 50);

	expect(parts).toEqual({x: 50, y: 0});
});
