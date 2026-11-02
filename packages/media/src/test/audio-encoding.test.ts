import {assert, expect, test} from 'vitest';
import {extractAudio} from '../audio-extraction/extract-audio';
import {getMaxVideoCacheSize, globalMediaCache} from '../caches';

// FFmpeg reference at 1 / 30 second, with the MP3's LAME encoder delay removed.
// prettier-ignore
const expectedFirst100 = [
	602, 518, 1047, 1029, 938, 916, 439, 361, 299, 195,
	849, 767, 1277, 1229, 876, 884, 300, 387, 274, 441,
	736, 960, 1203, 1437, 1044, 1278, 444, 720, 460, 784,
	1329, 1677, 1929, 2309, 1483, 1873, 853, 1207, 1000, 1343,
	1456, 1838, 1564, 1985, 1195, 1627, 455, 871, 122, 513,
	598, 983, 1001, 1367, 744, 1078, 270, 624, 167, 572,
	543, 968, 833, 1265, 616, 1043, 360, 742, 520, 879,
	750, 1152, 553, 1006, 145, 617, 141, 626, 579, 1073,
	767, 1238, 185, 595, -595, -258, -484, -194, 313, 606,
	489, 805, -247, 37, -930, -752, -845, -742, -193, -69,
];

test('Audio samples from MP3 should produce identical s16 output on Chrome and Firefox', async (t) => {
	// TODO: Why is it different on webkit?
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const a = await extractAudio({
		sampleRate: 48000,
		src: '/mp3-f32-audio.mp3',
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
		credentials: undefined,
		mediaCache: globalMediaCache,
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

	const actual = a.data.data;
	expect(actual.length).toBeGreaterThanOrEqual(100);

	for (let i = 0; i < expectedFirst100.length; i++) {
		expect(
			Math.abs(actual[i] - expectedFirst100[i]),
			`Sample ${i}: expected ~${expectedFirst100[i]}, got ${actual[i]}`,
		).toBeLessThanOrEqual(1);
	}
});
