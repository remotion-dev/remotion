import {expect, test} from 'bun:test';
import {sanitizeFilePath} from '../assets/sanitize-filepath';

test('sanitizeFilePath linux', () => {
	if (process.platform === 'win32') {
		return;
	}

	expect(sanitizeFilePath('/path/to/path')).toBe('/path/to/path');
	expect(sanitizeFilePath('\\path\\to\\path')).toBe('/path/to/path');
});

test('sanitizeFilePath windows', () => {
	if (process.platform !== 'win32') {
		return;
	}

	expect(sanitizeFilePath('/path/to/path')).toBe('\\path\\to\\path');
});
