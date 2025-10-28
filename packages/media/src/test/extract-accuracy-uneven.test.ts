import {assert, expect, test} from 'vitest';
import {extractAudio} from '../audio-extraction/extract-audio';

test('Extract accuracy over 100 frames with playback rate 1.75', async () => {
	const FPS = 25;
	const NUM_FRAMES = 100;
	const PLAYBACK_RATE = 1.75;

	for (let i = 0; i < NUM_FRAMES; i++) {
		const timeInSeconds = i / FPS;
		const audio = await extractAudio({
			audioStreamIndex: 0,
			timeInSeconds,
			durationInSeconds: 1 / FPS,
			playbackRate: PLAYBACK_RATE,
			fps: FPS,
			logLevel: 'info',
			loop: false,
			src: 'https://remotion.media/video.mp4',
			trimBefore: undefined,
			trimAfter: undefined,
		});
		if (audio === 'cannot-decode') {
			throw new Error(`Cannot decode at frame ${i}`);
		}

		if (audio === 'unknown-container-format') {
			throw new Error(`Unknown container format at frame ${i}`);
		}

		assert(audio);
		assert(audio.data);

		// All chunks must have consistent sizes for clean audio
		expect(audio.data.data.length).toBe(3840);
		expect(audio.data.timestamp).toBe(i * 80000);
		expect(audio.data.numberOfFrames).toBe(1920);
	}
});
