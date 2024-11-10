import {exampleVideos} from '@remotion/example-videos';
import {VideoMetadata, getVideoMetadata} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import path from 'node:path';

import {existsSync} from 'node:fs';

test('Should return video metadata', async () => {
	const metadataResponse = await getVideoMetadata(exampleVideos.framer24fps, {
		logLevel: 'info',
	});

	const videoMetadata: VideoMetadata = {
		fps: 24,
		width: 1080,
		height: 1080,
		durationInSeconds: 4.166667,
		codec: 'h264',
		canPlayInVideoTag: true,
		supportsSeeking: true,
		colorSpace: 'bt601',
		audioCodec: null,
		audioFileExtension: null,
		pixelFormat: 'yuv420p',
	};

	expect(metadataResponse).toEqual(videoMetadata);
});

test('Should return video metadata', async () => {
	const metadataResponse = await getVideoMetadata(exampleVideos.customDar, {
		logLevel: 'info',
	});

	expect(metadataResponse.supportsSeeking).toEqual(true);
	expect(metadataResponse.colorSpace).toEqual('bt601');
	expect(metadataResponse.audioCodec).toEqual('aac');
	expect(metadataResponse.audioFileExtension).toEqual('aac');
});

test('Should return AV1 video data', async () => {
	const metadataResponse = await getVideoMetadata(exampleVideos.av1, {
		logLevel: 'info',
	});
	expect(metadataResponse.codec).toEqual('av1');
	expect(metadataResponse.colorSpace).toEqual('bt709');
	expect(metadataResponse.audioCodec).toEqual(null);
	expect(metadataResponse.audioFileExtension).toEqual(null);
});

test('Should return AV1 video data', async () => {
	const metadataResponse = await getVideoMetadata(exampleVideos.webcam, {
		logLevel: 'info',
	});
	expect(metadataResponse.codec).toEqual('vp8');
	expect(metadataResponse.colorSpace).toEqual('bt709');
	expect(metadataResponse.audioCodec).toEqual('opus');
	expect(metadataResponse.audioFileExtension).toEqual('opus');
});

test('Should return HEVC video codec', async () => {
	const metadataResponse = await getVideoMetadata(exampleVideos.iphonevideo, {
		logLevel: 'info',
	});
	expect(metadataResponse.codec).toEqual('h265');
	expect(metadataResponse.canPlayInVideoTag).toEqual(true);
	expect(metadataResponse.colorSpace).toEqual('bt2020-ncl');
	expect(metadataResponse.audioCodec).toEqual('aac');
	expect(metadataResponse.audioFileExtension).toEqual('aac');
});

test('Should return an error due to non existing file', async () => {
	try {
		await getVideoMetadata('invalid', {logLevel: 'info'});
	} catch (err) {
		expect((err as Error).message).toContain(
			'Compositor error: No such file or directory',
		);
	}
});

test('Should return an error due to using a audio file', async () => {
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
		await getVideoMetadata(audioFile, {logLevel: 'info'});
	} catch (err) {
		expect((err as Error).message).toContain(
			'Compositor error: No video stream found',
		);
	}
});

test('Should not return duration in variable fps video', async () => {
	const video = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'example',
		'public',
		'variablefps-no-duration.webm',
	);
	expect(existsSync(video)).toEqual(true);

	const hi = await getVideoMetadata(video, {logLevel: 'info'});
	expect(hi.durationInSeconds).toBe(null);
});
