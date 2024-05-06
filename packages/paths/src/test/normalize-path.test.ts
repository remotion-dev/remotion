import {expect, test} from 'bun:test';
import {normalizePath} from '../normalize-path';

test('Should be able to normalize a path', () => {
	const reversedPath = normalizePath(`
  M 50 50 l 100 0
  `);
	expect(reversedPath).toEqual('M 50 50 L 150 50');
});
