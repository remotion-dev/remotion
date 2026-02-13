import {assert, expect, test} from 'vitest';
import {extractAudio} from '../audio-extraction/extract-audio';
import {getMaxVideoCacheSize} from '../caches';

// prettier-ignore
const expectedFirst100 = [
	-789, -1070, -916, -1137, -793, -996, -791, -1015, -1008, -1222,
	-1020, -1198, -767, -929, -502, -679, -239, -463, -31, -296,
	-44, -314, -260, -530, -459, -738, -391, -646, -146, -364,
	-170, -395, -532, -798, -752, -1038, -527, -789, -103, -340,
	60, -169, -62, -264, -38, -198, 242, 68, 532, 298,
	814, 567, 1073, 858, 1168, 951, 1157, 907, 1093, 830,
	1060, 811, 1337, 1105, 1670, 1455, 1429, 1233, 847, 666,
	692, 523, 1065, 943, 1415, 1352, 1260, 1199, 840, 748,
	722, 654, 688, 668, 305, 293, 19, 22, 157, 212,
	222, 301, -26, 33, -293, -245, -349, -289, -150, -71,
];

test('Audio samples from MP3 should produce identical s16 output on Chrome and Firefox', async () => {
	const a = await extractAudio({
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
