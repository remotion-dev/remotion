import {expect, test} from 'vitest';
import {getLength} from '../get-length';
import {splitParts} from '../split-parts';

test('Should be able to get parts of a path', () => {
	const parts = splitParts(`
  M 0 0 L 100 0
  m 0 100 L 100 100 L 100 200
  `);

	expect(parts).toEqual(['M 0 0 L 100 0', 'M 100 100 L 100 100 L 100 200']);

	expect(parts.map((p) => getLength(p))).toEqual([100, 100]);
});
