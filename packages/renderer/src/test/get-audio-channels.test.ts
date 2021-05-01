import {existsSync} from 'fs';
import path from 'path';
import {getAudioChannels} from '../assets/get-audio-channels';

test('Get audio channels for video', async () => {
	const videoWithoutAudio = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'example',
		'src',
		'resources',
		'framer-music.mp4'
	);
	expect(existsSync(videoWithoutAudio)).toBe(true);
	const channels = await getAudioChannels(videoWithoutAudio);
	expect(channels).toBe(2);
});

test('Get audio channels for video without music', async () => {
	const videoWithAudio = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'example',
		'src',
		'resources',
		'framer.mp4'
	);
	expect(existsSync(videoWithAudio)).toBe(true);
	const channels = await getAudioChannels(videoWithAudio);
	expect(channels).toBe(0);
});

test('Get audio channels for video without music', async () => {
	const audio = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'example',
		'src',
		'resources',
		'sound1.mp3'
	);
	expect(existsSync(audio)).toBe(true);
	const channels = await getAudioChannels(audio);
	expect(channels).toBe(2);
});

test('Throw error if parsing a non video file', async () => {
	const tsFile = path.join(__dirname, '..', 'ffmpeg-flags.ts');
	expect(existsSync(tsFile)).toBe(true);
	expect(() => getAudioChannels(tsFile)).rejects.toThrow(
		/Invalid data found when processing input/
	);
});
