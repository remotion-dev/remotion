import path from 'path';
import {expect, test} from 'vitest';
import {guessExtensionForVideo} from '../guess-extension-for-media';

test('Guess extension for media - H264', async () => {
	const extension = await guessExtensionForVideo(
		path.join(
			__dirname,
			'..',
			'..',
			'..',
			'example',
			'public',
			'framermp4withoutfileextension'
		),
		process.cwd()
	);

	expect(extension).toBe('mp4');
});

test('Guess extension for media - WebM', async () => {
	const extension = await guessExtensionForVideo(
		path.join(__dirname, '..', '..', '..', 'example', 'public', 'framer.webm'),
		process.cwd()
	);

	expect(extension).toBe('webm');
});

test('Guess extension for media - WAV', async () => {
	const extension = await guessExtensionForVideo(
		path.join(__dirname, '..', '..', '..', 'example', 'public', '22khz.wav'),
		process.cwd()
	);

	expect(extension).toBe('wav');
});
