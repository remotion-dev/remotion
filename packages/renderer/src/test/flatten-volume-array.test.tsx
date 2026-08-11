import {expect, test} from 'bun:test';
import {flattenVolumeArray} from '../assets/flatten-volume-array';

test('Should be able to flatten volume array', () => {
	expect(flattenVolumeArray([1, 1, 1, 1, 1])).toBe(1);
	expect(flattenVolumeArray([1, 1, 1, 1, 0])).toEqual([1, 1, 1, 1, 0]);
	expect(() => flattenVolumeArray([])).toThrow(/must have at least 1 number/);
});
