import {expect, test} from 'bun:test';
import {getFileSource} from '../helpers/get-file-source';

test('Should not allow to read files outside of the project', () => {
	expect(() => getFileSource(process.cwd(), '/etc/passwd')).toThrow(
		/Not allowed to open/,
	);
	expect(() => getFileSource(process.cwd(), '.env')).toThrow(
		/Not allowed to open/,
	);
});
