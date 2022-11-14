import path from 'path';
import {expect, test} from 'vitest';
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
			'framermp4withoutfileextension'
		),
		remotionRoot: process.cwd(),
		ffprobeBinary: null,
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
			'framer.webm'
		),
		remotionRoot: process.cwd(),
		ffprobeBinary: null,
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
			'22khz.wav'
		),
		remotionRoot: process.cwd(),
		ffprobeBinary: null,
	});

	expect(extension).toBe('wav');
});
