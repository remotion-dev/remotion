import {test} from 'vitest';
import {extractAudio} from '../extract-audio';
import {exampleVideos} from './example-videos';

test('Should be able to extract the audio from a mp4 format video', async () => {
	await extractAudio({
		videoSource: exampleVideos.bigBuckBunny,
		audioOutput: exampleVideos.bigBuckBunny.replace(
			'bigbuckbunny.mp4',
			'bigbuckbunny.aac',
		),
		logLevel: 'verbose',
	});
});

test('Should be able to extract the audio from a webm format video', async () => {
	await extractAudio({
		videoSource: exampleVideos.webcam,
		audioOutput: exampleVideos.webcam.replace('webcam.webm', 'webcam.aac'),
		logLevel: 'verbose',
	});
});
