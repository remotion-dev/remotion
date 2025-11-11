import {assert, expect, test} from 'vitest';
import {keyframeManager} from '../caches';
import {applyVolume} from '../convert-audiodata/apply-volume';
import {extractFrameAndAudio} from '../extract-frame-and-audio';

test('Should be able to extract a frame', async () => {
	await keyframeManager.clearAll('info');

	const result = await extractFrameAndAudio({
		src: '/bigbuckbunny.mp4',
		timeInSeconds: 1,
		durationInSeconds: 1 / 30,
		playbackRate: 1,
		logLevel: 'info',
		includeAudio: true,
		includeVideo: true,
		loop: false,
		audioStreamIndex: 0,
		trimAfter: undefined,
		trimBefore: undefined,
		fps: 30,
	});

	if (result.type === 'cannot-decode') {
		throw new Error('Cannot decode');
	}

	if (result.type === 'network-error') {
		throw new Error('Network error');
	}

	if (result.type === 'unknown-container-format') {
		throw new Error('Unknown container format');
	}

	if (result.type === 'cannot-decode-alpha') {
		throw new Error('Cannot decode alpha');
	}

	const {audio, frame} = result;
	assert(audio);

	assert(frame);

	assert(audio);

	// duration = 1 / 30
	// channels = 2
	// bits = 16
	// sampleRate = 48000
	// 1 / 30 * 2 * 2 * 48000 = 6400
	// we round down start and round up duration
	expect(audio.data.byteLength).toBe(6404);

	const cacheStats = await keyframeManager.getCacheStats();
	expect(cacheStats.count).toBe(25);
});

test('Should be able to extract the last frame', async () => {
	await keyframeManager.clearAll('info');

	const result = await extractFrameAndAudio({
		src: '/bigbuckbunny.mp4',
		timeInSeconds: 1_000_000,
		durationInSeconds: 1 / 30,
		playbackRate: 1,
		logLevel: 'info',
		includeAudio: true,
		includeVideo: true,
		loop: false,
		audioStreamIndex: 0,
		trimAfter: undefined,
		trimBefore: undefined,
		fps: 30,
	});

	if (result.type === 'cannot-decode') {
		throw new Error('Cannot decode');
	}

	if (result.type === 'network-error') {
		throw new Error('Network error');
	}

	if (result.type === 'unknown-container-format') {
		throw new Error('Unknown container format');
	}

	if (result.type === 'cannot-decode-alpha') {
		throw new Error('Cannot decode alpha');
	}

	const {audio, frame} = result;

	assert(frame);

	assert(!audio);

	const cacheStats = await keyframeManager.getCacheStats();
	expect(cacheStats.count).toBe(1);
});

test('Should manage the cache', async () => {
	await keyframeManager.clearAll('info');

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
			audioStreamIndex: 0,
			trimAfter: undefined,
			trimBefore: undefined,
			fps: 30,
		});
	}

	const cacheStats = await keyframeManager.getCacheStats();
	expect(cacheStats.count).toBe(725);
	expect(cacheStats.totalSize).toBe(1002240000);
});

test('Should be apply volume correctly', async () => {
	await keyframeManager.clearAll('info');

	const result = await extractFrameAndAudio({
		src: '/bigbuckbunny.mp4',
		timeInSeconds: 1,
		durationInSeconds: 1 / 30,
		playbackRate: 1,
		logLevel: 'info',
		includeAudio: true,
		includeVideo: false,
		loop: false,
		audioStreamIndex: 0,
		trimAfter: undefined,
		trimBefore: undefined,
		fps: 30,
	});

	if (result.type === 'cannot-decode') {
		throw new Error('Cannot decode');
	}

	if (result.type === 'network-error') {
		throw new Error('Network error');
	}

	if (result.type === 'unknown-container-format') {
		throw new Error('Unknown container format');
	}

	if (result.type === 'cannot-decode-alpha') {
		throw new Error('Cannot decode alpha');
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
	await keyframeManager.clearAll('info');

	const result = await extractFrameAndAudio({
		src: `/bigbuckbunny.mp4`,
		timeInSeconds: 10000001,
		durationInSeconds: 1 / 30,
		logLevel: 'info',
		playbackRate: 1,
		includeAudio: true,
		includeVideo: true,
		loop: true,
		audioStreamIndex: 0,
		trimAfter: undefined,
		trimBefore: undefined,
		fps: 30,
	});

	if (result.type === 'cannot-decode') {
		throw new Error('Cannot decode');
	}

	if (result.type === 'network-error') {
		throw new Error('Network error');
	}

	if (result.type === 'unknown-container-format') {
		throw new Error('Unknown container format');
	}

	if (result.type === 'cannot-decode-alpha') {
		throw new Error('Cannot decode alpha');
	}

	const {frame} = result;

	assert(frame);
});
