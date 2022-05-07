import {existsSync} from 'fs';
import path from 'path';
import {getAudioChannelsAndDuration} from '../assets/get-audio-channels';

jest.setTimeout(10000);

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
	expect(existsSync(videoWithoutAudio)).toEqual(true);
	const channels = await getAudioChannelsAndDuration(videoWithoutAudio);
	expect(channels).toEqual({channels: 2, duration: 10});
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
	expect(existsSync(videoWithAudio)).toEqual(true);
	const channels = await getAudioChannelsAndDuration(videoWithAudio);
	expect(channels).toEqual({channels: 0, duration: 3.334});
});

test('Get audio channels for video with music', async () => {
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
	expect(existsSync(audio)).toEqual(true);
	const channels = await getAudioChannelsAndDuration(audio);
	expect(channels).toEqual({channels: 2, duration: 56.529});
});

test('Throw error if parsing a non video file', () => {
	const tsFile = path.join(__dirname, '..', 'ffmpeg-flags.ts');
	expect(existsSync(tsFile)).toEqual(true);
	expect(() => getAudioChannelsAndDuration(tsFile)).rejects.toThrow(
		/Invalid data found when processing input/
	);
});
