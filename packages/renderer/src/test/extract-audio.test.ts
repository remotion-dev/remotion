import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {unlinkSync} from 'node:fs';
import {extractAudio} from '../extract-audio';

test('Should be able to extract the audio from a mp4 format video', async () => {
	const audioOutput = exampleVideos.bigBuckBunny.replace(
		'bigbuckbunny.mp4',
		'bigbuckbunny.aac',
	);
	await extractAudio({
		videoSource: exampleVideos.bigBuckBunny,
		audioOutput,
		logLevel: 'info',
	});
	unlinkSync(audioOutput);
});

test('Should not be able to extract the audio with the wrong audio format', async () => {
	const audioOutput = exampleVideos.bigBuckBunny.replace(
		'bigbuckbunny.mp4',
		'bigbuckbunny.aac',
	);
	await expect(() => {
		return extractAudio({
			videoSource: exampleVideos.webcam,
			audioOutput,
			logLevel: 'info',
		});
	}).toThrow(/Input audio codec: 'AV_CODEC_ID_OPUS'. Error: Invalid argument/);
	unlinkSync(audioOutput);
});

test('Should be able to extract the audio from a webm with the right format', async () => {
	const audioOutput = exampleVideos.webcam.replace(
		'webcam.webm',
		'webcam.opus',
	);
	await extractAudio({
		videoSource: exampleVideos.webcam,
		audioOutput,
		logLevel: 'info',
	});
	unlinkSync(audioOutput);
});
