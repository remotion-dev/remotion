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

test('Dots in folder names should not count', () => {
	expect(getExtensionOfFilename('/Users/john.doe/frames')).toBe(null);
	expect(getExtensionOfFilename('my.project/frames')).toBe(null);
	expect(getExtensionOfFilename('../frames')).toBe(null);
	expect(getExtensionOfFilename('C:\\Users\\john.doe\\frames')).toBe(null);
});

test('Extension comes from the file name, not a folder', () => {
	expect(getExtensionOfFilename('/Users/john.doe/out.mp4')).toBe('mp4');
	expect(getExtensionOfFilename('../out.mov')).toBe('mov');
	expect(getExtensionOfFilename('C:\\Users\\john.doe\\out.webm')).toBe('webm');
});
