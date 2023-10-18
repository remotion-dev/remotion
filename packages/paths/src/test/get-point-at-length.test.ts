import {expect, test} from 'vitest';
import {getPointAtLength} from '../get-point-at-length';

test('Should be able to get parts of a path', () => {
	const parts = getPointAtLength('M 0 0 L 100 0', 50);

	expect(parts).toEqual({x: 50, y: 0});
});

test.only('Another more complex point', () => {
	const path = `M2 129
		
		C48.6667 84.6666 186 2
		 324 1.99997C476.135 1.99994 616
		 89.9999 663 129`;

	const point = getPointAtLength(path, 721.1239854719418 * 0.51);
	expect(point.x).not.toBe(663);
	expect(point.y).not.toBe(129);
	console.log(point);
});
