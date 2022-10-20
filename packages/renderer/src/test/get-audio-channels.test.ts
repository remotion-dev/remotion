import {existsSync} from 'fs';
import path from 'path';
import {expect, test} from 'vitest';
import {makeDownloadMap} from '../assets/download-map';
import {getAudioChannelsAndDuration} from '../assets/get-audio-channels';

test('Get audio channels for video', async () => {
	const downloadMap = makeDownloadMap();
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
	const channels = await getAudioChannelsAndDuration(
		downloadMap,
		videoWithoutAudio,
		null,
		process.cwd()
	);
	expect(channels).toEqual({channels: 2, duration: 10});
}, 90000);

test('Get audio channels for video without music', async () => {
	const downloadMap = makeDownloadMap();
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
	const channels = await getAudioChannelsAndDuration(
		downloadMap,
		videoWithAudio,
		null,
		process.cwd()
	);
	expect(channels.channels).toEqual(0);
	expect(channels.duration).toBeCloseTo(3.34, 2);
}, 90000);

test('Get audio channels for video with music', async () => {
	const downloadMap = makeDownloadMap();
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
	const channels = await getAudioChannelsAndDuration(
		downloadMap,
		audio,
		null,
		process.cwd()
	);
	expect(channels).toEqual({channels: 2, duration: 56.529});
}, 90000);

test('Throw error if parsing a non video file', () => {
	const downloadMap = makeDownloadMap();
	const tsFile = path.join(__dirname, '..', 'ffmpeg-flags.ts');
	expect(existsSync(tsFile)).toEqual(true);
	expect(() =>
		getAudioChannelsAndDuration(downloadMap, tsFile, null, process.cwd())
	).rejects.toThrow(/Invalid data found when processing input/);
});
