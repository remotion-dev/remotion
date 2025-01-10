import {expect, test} from 'bun:test';
import {staticFile} from '../static-file.js';

test('duplicate staticFile() should throw a warning', () => {
	if (typeof Bun === 'undefined') {
		// @ts-expect-error
		global.window = {
			remotion_staticBase: '/static-abcdef',
		};
	}

	expect(() => staticFile(staticFile('file.mp3'))).toThrow(
		'The value "/static-abcdef/file.mp3" is already prefixed with the static base /static-abcdef. You don\'t need to call staticFile() on it.',
	);
});

test('"https//" in staticFile() should throw an error', () => {
	expect(() => staticFile(staticFile('https://'))).toThrow(
		'staticFile() does not support remote URLs - got "https://". Instead, pass the URL without wrapping it in staticFile(). See: https://remotion.dev/docs/staticfile-remote-urls',
	);
});

test('Single use of staticFile should not thrown an error', () => {
	const staticBase = window.remotion_staticBase;
	expect(staticFile('file.mp3')).toBe(staticBase + '/file.mp3');
});
