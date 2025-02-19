import {expect, test} from 'bun:test';
import {truthy} from '../truthy.js';

test.each<[unknown, boolean]>([
	['true', true],
	['false', true],
	['True', true],
	['False', true],
	['', false],
	['abc', true],
	[true, true],
	[false, false],
	[null, false],
	[undefined, false],
	[0, false],
	[1, true],
	[0.5, true],
	[12, true],
	[-1, true],
	[-4, true],
])('test with %s', (input, expected) => {
	expect(truthy(input)).toEqual(expected);
});
