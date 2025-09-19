import {assert, expect, test} from 'vitest';
import {keyframeManager} from '../caches';
import {extractFrameAndAudio} from '../extract-frame-and-audio';

test('Should be able to extract a frame', async () => {
	await keyframeManager.clearAll();

	const {audio, frame} = await extractFrameAndAudio({
		src: '/bigbuckbunny.mp4',
		timeInSeconds: 1,
		durationInSeconds: 1 / 30,
		logLevel: 'info',
		includeAudio: true,
		includeVideo: true,
		volume: 1,
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
	for (let i = 0; i < 50; i++) {
		await extractFrameAndAudio({
			src: `/bigbuckbunny.mp4?i=${i}`,
			timeInSeconds: 1,
			durationInSeconds: 1 / 30,
			logLevel: 'info',
			includeAudio: true,
			includeVideo: true,
			volume: 1,
		});
	}

	const cacheStats = await keyframeManager.getCacheStats();
	expect(cacheStats.count).toBe(725);
	expect(cacheStats.totalSize).toBe(1002240000);
});

test('Should be apply volume correctly', async () => {
	await keyframeManager.clearAll();

	const {audio: audioAtHalfVolume} = await extractFrameAndAudio({
		src: '/bigbuckbunny.mp4',
		timeInSeconds: 1,
		durationInSeconds: 1 / 30,
		logLevel: 'info',
		includeAudio: true,
		includeVideo: false,
		volume: 0.5,
	});

	const {audio: audioAtFullVolume, frame} = await extractFrameAndAudio({
		src: '/bigbuckbunny.mp4',
		timeInSeconds: 1,
		durationInSeconds: 1 / 30,
		logLevel: 'info',
		includeAudio: true,
		includeVideo: false,
		volume: 1,
	});

	assert(!frame);

	const totalAudioAtFullVolume = audioAtFullVolume?.data.reduce((acc, curr) => {
		const unrounded = curr * 0.5;
		const rounded = curr > 0 ? Math.floor(unrounded) : Math.ceil(unrounded);
		return acc + rounded;
	}, 0);
	assert(audioAtHalfVolume);
	const totalAudioAtHalfVolume = audioAtHalfVolume?.data.reduce(
		(acc, curr) => acc + curr,
		0,
	);
	assert(totalAudioAtFullVolume);
	expect(totalAudioAtHalfVolume).toBe(totalAudioAtFullVolume);
});
