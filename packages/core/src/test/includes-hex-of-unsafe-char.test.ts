import {expect, test} from 'bun:test';
import type {HexInfo} from '../static-file.js';
import {includesHexOfUnsafeChar} from '../static-file.js';

test('should find hex', () => {
	const unsafeName = 'test%2Fexample#music';

	const actual = includesHexOfUnsafeChar(unsafeName);
	const expected: HexInfo = {
		containsHex: true,
		hexCode: '%2F',
	};
	expect(actual).toEqual(expected);
});
