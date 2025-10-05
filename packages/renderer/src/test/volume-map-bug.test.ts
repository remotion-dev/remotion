import {expect, test} from 'bun:test';
import {makeVolumeMap} from '../assets/ffmpeg-volume-expression';

test('should build volume map', () => {
	const mockVolume = new Array(150).fill(true).map((_, i) => i * 0.01);
	const volume = makeVolumeMap(mockVolume);

	const keys = Object.keys(volume);
	expect(keys.length).toBe(98);
});
