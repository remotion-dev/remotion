import {expect, test} from 'bun:test';
import {existsSync} from 'node:fs';
import path from 'node:path';
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
		'framer-music.mp4',
	);
	expect(existsSync(videoWithoutAudio)).toEqual(true);
	const channels = await getAudioChannelsAndDurationWithoutCache({
		src: videoWithoutAudio,
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
		audioStreamIndex: 0,
	});
	expect(channels).toEqual({channels: 2, duration: 10, startTime: 0});
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
		'framer.mp4',
	);
	expect(existsSync(videoWithAudio)).toEqual(true);
	const channels = await getAudioChannelsAndDurationWithoutCache({
		src: videoWithAudio,
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
		audioStreamIndex: 0,
	});

	expect(channels.channels).toEqual(0);
	expect(channels.duration).toBeCloseTo(3.334, 2);
}, 90000);

test('Get audio channels for mp3', async () => {
	const downloadMap = makeDownloadMap();
	const audio = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'example',
		'src',
		'resources',
		'sound1.mp3',
	);
	expect(existsSync(audio)).toEqual(true);
	const channels = await getAudioChannelsAndDuration({
		downloadMap,
		src: audio,
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
		audioStreamIndex: 0,
	});
	cleanDownloadMap(downloadMap);

	expect(channels).toEqual({
		channels: 2,
		duration: 56.52898,
		startTime: 0,
	});
}, 90000);

test('Throw error if parsing a non video file', () => {
	const downloadMap = makeDownloadMap();
	const tsFile = path.join(__dirname, '..', 'can-use-parallel-encoding.ts');
	expect(existsSync(tsFile)).toEqual(true);
	expect(() =>
		getAudioChannelsAndDuration({
			downloadMap,
			src: tsFile,
			indent: false,
			logLevel: 'info',
			binariesDirectory: null,
			cancelSignal: undefined,
			audioStreamIndex: 0,
		}),
	).toThrow(/Invalid data found when processing input/);
	cleanDownloadMap(downloadMap);
});
