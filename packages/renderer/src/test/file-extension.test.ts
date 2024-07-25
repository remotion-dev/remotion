import {expect, test} from 'bun:test';
import {getExtensionOfFilename} from '../get-extension-of-filename';

test('Get extension of filename', () => {
	const filename = './test.mp4';
	const extension = getExtensionOfFilename(filename);
	expect(extension).toBe('mp4');
});

test('Dot slash should not count', () => {
	const filename = './out';
	const extension = getExtensionOfFilename(filename);
	expect(extension).toBe(null);
});
