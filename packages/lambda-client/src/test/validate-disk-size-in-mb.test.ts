import {expect, test} from 'bun:test';
import {validateDiskSizeInMb} from '../validate-disk-size-in-mb';

test('Disk size tests', () => {
	expect(() => validateDiskSizeInMb(512)).not.toThrow();
	expect(() => validateDiskSizeInMb(10240)).not.toThrow();
	expect(() => {
		validateDiskSizeInMb(0);
	}).toThrow(
		/parameter 'diskSizeInMb' must be between 512 and 10240, but got 0/,
	);
	expect(() => {
		validateDiskSizeInMb({});
	}).toThrow(/parameter 'diskSizeInMb' must be a number, got a object/);
});
