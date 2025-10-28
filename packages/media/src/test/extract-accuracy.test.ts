import {assert, expect, test} from 'vitest';
import {extractAudio} from '../audio-extraction/extract-audio';

test('Extract accuracy', async () => {
	const audio1 = await extractAudio({
		audioStreamIndex: 0,
		timeInSeconds: 0,
		durationInSeconds: 1 / 25,
		playbackRate: 2,
		fps: 25,
		logLevel: 'info',
		loop: false,
		src: 'https://remotion.media/video.mp4',
		trimBefore: undefined,
		trimAfter: undefined,
	});
	if (audio1 === 'cannot-decode') {
		throw new Error('Cannot decode');
	}

	if (audio1 === 'unknown-container-format') {
		throw new Error('Unknown container format');
	}

	assert(audio1);
	assert(audio1.data);
	expect(audio1.data.data.length).toBe(3840);
	expect(audio1.data.timestamp).toBe(0);
	expect(audio1.data.numberOfFrames).toBe(1920);

	const audio2 = await extractAudio({
		audioStreamIndex: 0,
		timeInSeconds: 1 / 25,
		durationInSeconds: 1 / 25,
		playbackRate: 2,
		fps: 25,
		logLevel: 'info',
		loop: false,
		src: 'https://remotion.media/video.mp4',
		trimBefore: undefined,
		trimAfter: undefined,
	});
	if (audio2 === 'cannot-decode') {
		throw new Error('Cannot decode');
	}

	if (audio2 === 'unknown-container-format') {
		throw new Error('Unknown container format');
	}

	assert(audio2);
	assert(audio2.data);
	expect(audio2.data.data.length).toBe(3840);
	expect(audio2.data.timestamp).toBe(80000);
	expect(audio2.data.numberOfFrames).toBe(1920);

	const audio3 = await extractAudio({
		audioStreamIndex: 0,
		timeInSeconds: 2 / 25,
		durationInSeconds: 1 / 25,
		playbackRate: 2,
		fps: 25,
		logLevel: 'info',
		loop: false,
		src: 'https://remotion.media/video.mp4',
		trimBefore: undefined,
		trimAfter: undefined,
	});
	if (audio3 === 'cannot-decode') {
		throw new Error('Cannot decode');
	}

	if (audio3 === 'unknown-container-format') {
		throw new Error('Unknown container format');
	}

	assert(audio3);
	assert(audio3.data);
	expect(audio3.data.data.length).toBe(3840);
	expect(audio3.data.timestamp).toBe(159978.83333333334);
	expect(audio3.data.numberOfFrames).toBe(1920);
});
