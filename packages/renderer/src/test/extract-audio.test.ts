import {test} from 'vitest';
import {extractAudio} from '../extract-audio';
import {exampleVideos} from './example-videos';

test('Should be able to extract the audio from a video', async () => {
	await extractAudio({
		videoSource: exampleVideos.webcam,
		audioOutput: exampleVideos.webcam.replace('webcam.webm', 'webcam.aac'),
		logLevel: 'verbose',
	});
});
