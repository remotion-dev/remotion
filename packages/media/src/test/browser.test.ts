import {assert, expect, test} from 'vitest';
import {keyframeManager} from '../caches';
import {applyVolume} from '../convert-audiodata/apply-volume';
import {extractFrameAndAudio} from '../extract-frame-and-audio';

test('Should be able to extract a frame', async () => {
	await keyframeManager.clearAll();

	const result = await extractFrameAndAudio({
		src: '/bigbuckbunny.mp4',
		timeInSeconds: 1,
		durationInSeconds: 1 / 30,
		playbackRate: 1,
		logLevel: 'info',
		includeAudio: true,
		includeVideo: true,
		loop: false,
	});

	if (result === 'cannot-decode') {
		throw new Error('Cannot decode');
	}

	const {audio, frame} = result;
	assert(audio);

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

test('Should be able to extract the last frame', async () => {
	await keyframeManager.clearAll();

	const result = await extractFrameAndAudio({
		src: '/bigbuckbunny.mp4',
		timeInSeconds: 1_000_000,
		durationInSeconds: 1 / 30,
		playbackRate: 1,
		logLevel: 'info',
		includeAudio: true,
		includeVideo: true,
		loop: false,
	});

	if (result === 'cannot-decode') {
		throw new Error('Cannot decode');
	}

	const {audio, frame} = result;

	assert(frame);
	expect(frame.timestamp).toBe(59_958_333);

	assert(!audio);

	const cacheStats = await keyframeManager.getCacheStats();
	expect(cacheStats.count).toBe(93);
});

test('Should manage the cache', async () => {
	await keyframeManager.clearAll();
	for (let i = 0; i < 50; i++) {
		await extractFrameAndAudio({
			src: `/bigbuckbunny.mp4?i=${i}`,
			timeInSeconds: 1,
			durationInSeconds: 1 / 30,
			playbackRate: 1,
			logLevel: 'info',
			includeAudio: true,
			includeVideo: true,
			loop: false,
		});
	}

	const cacheStats = await keyframeManager.getCacheStats();
	expect(cacheStats.count).toBe(725);
	expect(cacheStats.totalSize).toBe(1002240000);
});

test('Should be apply volume correctly', async () => {
	await keyframeManager.clearAll();

	const result = await extractFrameAndAudio({
		src: '/bigbuckbunny.mp4',
		timeInSeconds: 1,
		durationInSeconds: 1 / 30,
		playbackRate: 1,
		logLevel: 'info',
		includeAudio: true,
		includeVideo: false,
		loop: false,
	});

	if (result === 'cannot-decode') {
		throw new Error('Cannot decode');
	}

	const {audio: audioAtFullVolume, frame} = result;

	const totalAudioAtFullVolume = audioAtFullVolume?.data.reduce((acc, curr) => {
		const unrounded = curr * 0.5;
		const rounded = curr > 0 ? Math.floor(unrounded) : Math.ceil(unrounded);
		return acc + rounded;
	}, 0);
	applyVolume(audioAtFullVolume!.data, 0.5);

	assert(!frame);

	const totalAudioAtHalfVolume = audioAtFullVolume?.data.reduce(
		(acc, curr) => acc + curr,
		0,
	);
	assert(totalAudioAtFullVolume);
	expect(totalAudioAtHalfVolume).toBe(totalAudioAtFullVolume);
});

test('Should be able to loop', async () => {
	await keyframeManager.clearAll();
	const result = await extractFrameAndAudio({
		src: `/bigbuckbunny.mp4`,
		timeInSeconds: 10000001,
		durationInSeconds: 1 / 30,
		logLevel: 'info',
		playbackRate: 1,
		includeAudio: true,
		includeVideo: true,
		loop: true,
	});

	if (result === 'cannot-decode') {
		throw new Error('Cannot decode');
	}

	const {frame} = result;

	expect(frame?.timestamp).toBe(41_000_000);
});
