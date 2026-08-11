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

test(
	'Noise should be cached',
	() => {
		const start = performance.now();
		noise2D('new-seed', 0.5, 0.5);
		const end = performance.now();
		const time = end - start;

		const start2 = performance.now();
		noise2D('new-seed', 0.5, 0.5);
		const end2 = performance.now();
		const time2 = end2 - start2;
		expect(time2 * 10).toBeLessThan(time);
	},
	{retry: 2},
);

test(
	'Should only keep 10 cache entries',
	() => {
		const start = performance.now();
		noise2D('seed-1', 0.5, 0.5);
		const end = performance.now();
		const time = end - start;

		noise2D('seed-2', 0.5, 0.5);
		noise2D('seed-3', 0.5, 0.5);
		noise2D('seed-4', 0.5, 0.5);
		noise2D('seed-5', 0.5, 0.5);
		noise2D('seed-6', 0.5, 0.5);
		noise2D('seed-7', 0.5, 0.5);
		noise2D('seed-8', 0.5, 0.5);
		noise2D('seed-9', 0.5, 0.5);
		noise2D('seed-10', 0.5, 0.5);
		noise2D('seed-11', 0.5, 0.5);
		noise2D('seed-12', 0.5, 0.5);

		const start2 = performance.now();
		noise2D('seed-1', 0.5, 0.5);
		const end2 = performance.now();
		const time2 = end2 - start2;
		if (typeof Bun === 'undefined') {
			expect(time2 * 4).toBeGreaterThan(time);
		}
	},
	{
		retry: 2,
	},
);

test(
	'Should only keep 10 cache entries (3D)',
	() => {
		const start = performance.now();
		noise3D('seed-1', 0.5, 0.5, 0.8);
		const end = performance.now();
		const time = end - start;

		noise3D('seed-2', 0.5, 0.5, 0.8);
		noise3D('seed-3', 0.5, 0.5, 0.8);
		noise3D('seed-4', 0.5, 0.5, 0.8);
		noise3D('seed-5', 0.5, 0.5, 0.8);
		noise3D('seed-6', 0.5, 0.5, 0.8);
		noise3D('seed-7', 0.5, 0.5, 0.8);
		noise3D('seed-8', 0.5, 0.5, 0.8);
		noise3D('seed-9', 0.5, 0.5, 0.8);
		noise3D('seed-10', 0.5, 0, 0.85);
		noise3D('seed-11', 0.5, 0, 0.85);
		noise3D('seed-12', 0.5, 0, 0.85);

		const start2 = performance.now();
		noise3D('seed-1', 0.5, 0.5, 0.8);
		const end2 = performance.now();
		const time2 = end2 - start2;

		if (typeof Bun === 'undefined') {
			expect(time2 * 4).toBeGreaterThan(time);
		}
	},
	{retry: 2},
);

test(
	'Should only keep 10 cache entries (4D)',
	() => {
		const start = performance.now();
		noise4D('seed-1', 0.5, 0.5, 0.8, 9);
		const end = performance.now();
		const time = end - start;

		noise4D('seed-2', 0.5, 0.5, 0.8, 9);
		noise4D('seed-3', 0.5, 0.5, 0.8, 9);
		noise4D('seed-4', 0.5, 0.5, 0.8, 9);
		noise4D('seed-5', 0.5, 0.5, 0.8, 9);
		noise4D('seed-6', 0.5, 0.5, 0.8, 9);
		noise4D('seed-7', 0.5, 0.5, 0.8, 9);
		noise4D('seed-8', 0.5, 0.5, 0.8, 9);
		noise4D('seed-9', 0.5, 0.5, 0.8, 9);
		noise4D('seed-10', 0.5, 0, 0.85, 9);
		noise4D('seed-11', 0.5, 0, 0.85, 9);
		noise4D('seed-12', 0.5, 0, 0.85, 9);

		const start2 = performance.now();
		noise4D('seed-1', 0.5, 0.5, 0.8, 9);
		const end2 = performance.now();
		const time2 = end2 - start2;
		if (typeof Bun === 'undefined') {
			expect(time2 * 4).toBeGreaterThan(time);
		}
	},
	{
		retry: 2,
	},
);
