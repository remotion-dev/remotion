import {validateDiskSizeInMb} from '../../shared/validate-disk-size-in-mb';
import {expectToThrow} from '../helpers/expect-to-throw';

test('Disk size tests', () => {
	expect(() => validateDiskSizeInMb(512)).not.toThrow();
	expect(() => validateDiskSizeInMb(10240)).not.toThrow();
	expectToThrow(() => {
		validateDiskSizeInMb(0);
	}, /parameter 'diskSizeInMb' must be between 512 and 10240, but got 0/);
	expectToThrow(() => {
		validateDiskSizeInMb({});
	}, /parameter 'diskSizeInMb' must be a number, got a object/);
});
