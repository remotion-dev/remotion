import {expect, test} from 'bun:test';
import {makeFileExtensionMap} from '../get-extension-from-codec';

test('Derive codec from file extension', () => {
	expect(makeFileExtensionMap()).toEqual({
		mkv: ['h264-mkv', 'h264', 'h265', 'prores', 'vp8', 'vp9'],
		aac: ['aac'],
		'3gp': ['aac'],
		m4a: ['aac'],
		m4b: ['aac'],
		mpg: ['aac'],
		mpeg: ['aac'],
		gif: ['gif'],
		mp4: ['h264', 'h265'],
		hevc: ['h265'],
		mp3: ['mp3'],
		mov: ['h264', 'prores'],
		mxf: ['prores'],
		webm: ['vp8', 'vp9'],
		wav: ['aac', 'mp3', 'wav'],
		ts: ['h264-ts'],
	});
});
