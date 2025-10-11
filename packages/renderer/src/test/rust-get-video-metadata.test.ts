import {expect, test} from 'bun:test';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {startLongRunningCompositor} from '../compositor/compositor';
import type {VideoMetadata} from '../compositor/payloads';

test('Should return video metadata', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 0,
	});

	const videoFile = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'example',
		'src',
		'resources',
		'framer-24fps.mp4',
	);
	expect(existsSync(videoFile)).toEqual(true);
	const metadataResponse = await compositor.executeCommand('GetVideoMetadata', {
		src: videoFile,
	});
	const metadataJson = JSON.parse(
		new TextDecoder('utf-8').decode(metadataResponse),
	);

	const data: VideoMetadata = {
		fps: 24,
		width: 1080,
		height: 1080,
		durationInSeconds: 4.166667,
		canPlayInVideoTag: true,
		codec: 'h264',
		supportsSeeking: true,
		colorSpace: 'bt601',
		audioCodec: null,
		audioFileExtension: null,
		pixelFormat: 'yuv420p',
	};
	expect(metadataJson).toEqual(data);
});

test('Should return an error due to non existing file', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 0,
	});

	try {
		await compositor.executeCommand('GetVideoMetadata', {
			src: 'invalid',
		});
	} catch (err) {
		expect((err as Error).message).toContain(
			'Compositor error: No such file or directory',
		);
	}
});

test('Should return an error due to using a audio file', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 0,
	});

	const audioFile = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'example',
		'src',
		'resources',
		'sound1.mp3',
	);
	expect(existsSync(audioFile)).toEqual(true);

	try {
		await compositor.executeCommand('GetVideoMetadata', {
			src: audioFile,
		});
	} catch (err) {
		expect((err as Error).message).toContain(
			'Compositor error: No video stream found',
		);
	}
});
