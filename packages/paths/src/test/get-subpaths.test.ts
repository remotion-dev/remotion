import {expect, test} from 'bun:test';
import {getLength} from '../get-length';
import {getSubpaths} from '../get-subpaths';

test('Should be able to get parts of a path', () => {
	const parts = getSubpaths(`
  M 0 0 L 100 0
  m 0 100 L 100 100 L 100 200
  `);

	expect(parts).toEqual(['M 0 0 L 100 0', 'M 100 100 L 100 100 L 100 200']);

	expect(parts.map((p) => getLength(p))).toEqual([100, 100]);
});
