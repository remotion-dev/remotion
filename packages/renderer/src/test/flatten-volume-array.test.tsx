import {flattenVolumeArray} from '../assets/flatten-volume-array';
import {expectToThrow} from './expect-to-throw';

test('Should be able to flatten volume array', () => {
	expect(flattenVolumeArray([1, 1, 1, 1, 1])).toBe(1);
	expect(flattenVolumeArray([1, 1, 1, 1, 0])).toEqual([1, 1, 1, 1, 0]);
	expectToThrow(() => flattenVolumeArray([]), /must have at least 1 number/);
});
