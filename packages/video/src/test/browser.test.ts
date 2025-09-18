import {assert, expect, test} from 'vitest';
import {extractFrameAndAudio, keyframeManager} from '../extract-frame';

test('Should be able to extract a frame', async () => {
	await keyframeManager.clearAll();

	const {audio, frame} = await extractFrameAndAudio({
		src: '/bigbuckbunny.mp4',
		timeInSeconds: 1,
		durationInSeconds: 1 / 30,
		logLevel: 'info',
		includeAudio: true,
	});

	assert(frame);
	expect(frame.timestamp).toBe(1_000_000);

	assert(audio);
	expect(audio.sampleRate).toBe(48000);

	// duration = 1 / 30
	// channels = 2
	// bits = 16
	// sampleRate = 48000
	// 1 / 30 * 2 * 2 * 48000 = 6400
	expect(audio.data.byteLength).toBe(6400);

	const cacheStats = await keyframeManager.getCacheStats();
	expect(cacheStats.count).toBe(25);
});

test('Should manage the cache', async () => {
	await keyframeManager.clearAll();
	for (let i = 0; i < 40; i++) {
		await extractFrameAndAudio({
			src: `/bigbuckbunny.mp4?i=${i}`,
			timeInSeconds: 1,
			durationInSeconds: 1 / 30,
			logLevel: 'info',
			includeAudio: true,
		});
	}

	const cacheStats = await keyframeManager.getCacheStats();
	expect(cacheStats.count).toBe(1000);
});
