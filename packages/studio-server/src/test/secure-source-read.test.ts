import {expect, test} from 'vitest';
import {getFileSource} from '../helpers/get-file-source';

test('Should not allow to read files outside of the project', () => {
	expect(() => getFileSource(process.cwd(), '/etc/passwd')).rejects.toMatch(
		/Not allowed to open/,
	);
	expect(() => getFileSource(process.cwd(), '.env')).rejects.toMatch(
		/Not allowed to open/,
	);
});
