import {expect, test} from 'vitest';
import {getParts} from '../get-parts';

test('Should be able to get parts of a path', () => {
	const parts = getParts(`
  M 0 0 L 100 0
  M 0 100 L 100 100 L 200 200
  `);
	expect(parts[0].length).toEqual(100);
	expect(parts[1].length).toEqual(100);
	expect(parts[0].getPointAtLength(100).x).toEqual(100);
});
