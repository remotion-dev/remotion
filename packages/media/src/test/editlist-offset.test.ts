import {assert, expect, test} from 'vitest';
import {extractAudio} from '../audio-extraction/extract-audio';
import {getMaxVideoCacheSize} from '../caches';

test('Audio extraction should be correct if there is edit list offset', async () => {
	// Time: 0.00sec, should return null
	const audio1 = await extractAudio({
		src: '/audio-with-64msoffset-editlist.mp4',
		audioStreamIndex: 0,
		durationInSeconds: 1 / 30,
		fps: 30,
		logLevel: 'info',
		loop: false,
		playbackRate: 1,
		timeInSeconds: 0 / 30,
		trimBefore: undefined,
		trimAfter: undefined,
		maxCacheSize: getMaxVideoCacheSize('info'),
	});
	assert(audio1 !== 'cannot-decode');
	assert(audio1 !== 'unknown-container-format');
	expect(audio1.data).toBe(null);
	expect(audio1.durationInSeconds).toBe(null);

	// Time: 0.033sec, should return audio
	const audio2 = await extractAudio({
		src: '/audio-with-64msoffset-editlist.mp4',
		audioStreamIndex: 0,
		durationInSeconds: 1 / 30,
		fps: 30,
		logLevel: 'info',
		loop: true,
		playbackRate: 1,
		timeInSeconds: 1 / 30,
		trimBefore: undefined,
		trimAfter: undefined,
		maxCacheSize: getMaxVideoCacheSize('info'),
	});
	assert(audio2 !== 'cannot-decode');
	assert(audio2 !== 'unknown-container-format');
	assert(audio2.data);
	expect(audio2.data.data.length).toBe(3200);
	expect(audio2.data.timestamp).toBe((1 / 30) * 1_000_000);
	expect(audio2.data.durationInMicroSeconds).toBe((1 / 30) * 1_000_000);
	expect(audio2.durationInSeconds).toBe(5.012666666666667);

	// Time: 0.066sec, should return audio
	const audio3 = await extractAudio({
		src: '/audio-with-64msoffset-editlist.mp4',
		audioStreamIndex: 0,
		durationInSeconds: 1 / 30,
		fps: 30,
		logLevel: 'info',
		loop: true,
		playbackRate: 1,
		timeInSeconds: 2 / 30,
		trimBefore: undefined,
		trimAfter: undefined,
		maxCacheSize: getMaxVideoCacheSize('info'),
	});
	assert(audio3 !== 'cannot-decode');
	assert(audio3 !== 'unknown-container-format');
	assert(audio3.data);
	expect(audio3.data.data.length).toBe(3200);
	expect(audio3.data.timestamp).toBe((2 / 30) * 1_000_000);
	expect(audio3.data.durationInMicroSeconds).approximately(
		(1 / 30) * 1_000_000,
		0.000001,
	);
	expect(audio3.durationInSeconds).toBe(5.012666666666667);
});
