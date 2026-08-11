import {expect, test} from 'bun:test';
import {getFileManagerName} from '../helpers/get-file-manager-name';

test('returns the platform-specific file manager name', () => {
	expect(getFileManagerName('darwin')).toBe('Finder');
	expect(getFileManagerName('win32')).toBe('File Explorer');
	expect(getFileManagerName('linux')).toBe('File Manager');
	expect(getFileManagerName(null)).toBe('File Manager');
});
