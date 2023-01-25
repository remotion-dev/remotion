import {expect, test} from 'vitest';
import {reversePath} from '../reverse-path';

test('Should be able to reverse a path', () => {
	const reversedPath = reversePath(`
  M 0 0 L 100 0
  `);
	expect(reversedPath).toEqual('M 100 0 L 0 0');
});
