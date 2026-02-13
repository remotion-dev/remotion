import {assert, expect, test} from 'vitest';
import {extractAudio} from '../audio-extraction/extract-audio';
import {getMaxVideoCacheSize} from '../caches';

test('Audio samples from MP3 should produce identical s16 output on Chrome and Firefox', async () => {
	const a = await extractAudio({
		src: '/sample-audio.mp3',
		timeInSeconds: 0.03333333333333333,
		logLevel: 'info',
		loop: false,
		trimAfter: undefined,
		trimBefore: undefined,
		playbackRate: 1,
		fps: 30,
		maxCacheSize: getMaxVideoCacheSize('info'),
		durationInSeconds: 1 / 30,
		audioStreamIndex: 0,
	});

	if (a === 'cannot-decode') {
		throw new Error('Cannot decode');
	}

	if (a === 'unknown-container-format') {
		throw new Error('Unknown container format');
	}

	if (a === 'network-error') {
		throw new Error('Network error');
	}

	assert(a);
	assert(a.data);

	expect(Array.from(a.data.data)).toMatchSnapshot('audio-encoding');
});
