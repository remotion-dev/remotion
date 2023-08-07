import {existsSync} from 'node:fs';
import path from 'node:path';
import {expect, test} from 'vitest';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';
import {
	getAudioChannelsAndDuration,
	getAudioChannelsAndDurationWithoutCache,
} from '../assets/get-audio-channels';

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
	const channels = await getAudioChannelsAndDurationWithoutCache(
		videoWithoutAudio
	);
	expect(channels).toEqual({channels: 2, duration: 10});
}, 90000);

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
	const channels = await getAudioChannelsAndDurationWithoutCache(
		videoWithAudio
	);

	expect(channels.channels).toEqual(0);
	expect(channels.duration).toBeCloseTo(3.334, 2);
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
	const channels = await getAudioChannelsAndDuration(downloadMap, audio);
	cleanDownloadMap(downloadMap);

	expect(channels).toEqual({channels: 2, duration: 56.529});
}, 90000);

test('Throw error if parsing a non video file', () => {
	const downloadMap = makeDownloadMap();
	const tsFile = path.join(__dirname, '..', 'can-use-parallel-encoding.ts');
	expect(existsSync(tsFile)).toEqual(true);
	expect(() =>
		getAudioChannelsAndDuration(downloadMap, tsFile)
	).rejects.toThrow(/Invalid data found when processing input/);
	cleanDownloadMap(downloadMap);
});
