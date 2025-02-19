import {expect, test} from 'bun:test';
import path from 'node:path';
import {guessExtensionForVideo} from '../guess-extension-for-media';

test('Guess extension for media - H264', async () => {
	const extension = await guessExtensionForVideo({
		src: path.join(
			__dirname,
			'..',
			'..',
			'..',
			'example',
			'public',
			'framermp4withoutfileextension',
		),
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
	});

	expect(extension).toBe('mp4');
});

test('Guess extension for media - WebM', async () => {
	const extension = await guessExtensionForVideo({
		src: path.join(
			__dirname,
			'..',
			'..',
			'..',
			'example',
			'public',
			'framer.webm',
		),
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
	});

	expect(extension).toBe('webm');
});

test('Guess extension for media - WAV', async () => {
	const extension = await guessExtensionForVideo({
		src: path.join(
			__dirname,
			'..',
			'..',
			'..',
			'example',
			'public',
			'22khz.wav',
		),
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
	});

	expect(extension).toBe('wav');
});

test('Guess extension for media - MP3', async () => {
	const extension = await guessExtensionForVideo({
		src: path.join(
			__dirname,
			'..',
			'..',
			'..',
			'example',
			'public',
			'music.mp3',
		),
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
	});

	expect(extension).toBe('mp3');
});
