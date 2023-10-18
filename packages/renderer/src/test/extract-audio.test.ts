import {execSync} from 'child_process';
import {test} from 'vitest';
import {extractAudio} from '../extract-audio';
import {exampleVideos} from './example-videos';

test('Should be able to extract the audio from a mp4 format video', async () => {
	await extractAudio({
		videoSource: exampleVideos.bigBuckBunny,
		audioOutput: 'hi',
		logLevel: 'verbose',
	});

	execSync('bunx remotion ffmpeg -i tones/rust.m4a tones/rust.wav -y', {
		stdio: 'inherit',
		cwd: '/Users/jonathanburger/audio-concatenation-research',
	});
});
