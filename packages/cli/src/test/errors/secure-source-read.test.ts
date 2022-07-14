import {expect, test} from 'vitest';
import {getFileSource} from '../../preview-server/error-overlay/react-overlay/utils/get-file-source';

test('Should not allow to read files outside of the project', () => {
	expect(() => getFileSource('/etc/passwd')).toThrow(/Not allowed to open/);
	expect(() => getFileSource('.env')).toThrow(/Not allowed to open/);
});
