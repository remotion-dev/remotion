import {test} from 'vitest';
import {getFileSource} from '../error-overlay/react-overlay/utils/get-file-source';
import {expectToThrow} from './expect-to-throw';

test('Should not allow to read files outside of the project', () => {
	expectToThrow(() => getFileSource('/etc/passwd'), /Not allowed to open/);
	expectToThrow(() => getFileSource('.env'), /Not allowed to open/);
});
