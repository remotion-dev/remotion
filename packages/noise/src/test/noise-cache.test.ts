import {expect, test} from 'bun:test';
import {noise2D, noise3D, noise4D} from '../index';

// Make Node.JS 14 pass
test(
	'Noise should be deterministic',
	() => {
		const noise1 = noise2D(1, 0, 0);
		const noise2 = noise2D(1, 0, 0);
		expect(noise1).toBe(noise2);
		expect(noise1).toBe(0);
		expect(noise2D('my-seed', 0.5, 0.5)).toBe(0.3071565136272162);
		expect(noise3D('my-seed', 0.7, 0.5, 0.5)).toBe(0.6402128434567901);
		expect(noise4D('my-seed', 0.7, 0.5, 0.5, 0.9)).toBe(0.2714290963058814);
	},
	{retry: 2},
);
