import {expect, test} from 'bun:test';
import {getLength} from '../get-length';

test('Should be able to get length of a path', () => {
	expect(getLength('M 0 0 L 100 0')).toBe(100);
});

test('Should throw error if path is invalid', () => {
	expect(() => getLength('remotion')).toThrow(/Malformed path data/);
});
