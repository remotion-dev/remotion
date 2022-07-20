import {expect, test} from 'vitest';
import {roundVolumeToAvoidStackOverflow} from '../assets/round-volume-to-avoid-stack-overflow';

test('Should avoid having more than 98 possible volumes to avoid FFMPEG exception', () => {
	const thousandsOfValues = new Array(10000)
		.fill(true)
		.map((_, i) => i / 9999)
		.map((t) => roundVolumeToAvoidStackOverflow(t));
	expect(new Set(thousandsOfValues).size).toBe(98);
});
