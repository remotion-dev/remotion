import {describe, expect, test} from 'bun:test';
import {measureSpring, spring} from '../spring/index.js';
import {expectToThrow} from './expect-to-throw.js';

describe('Measure spring should work', () => {
	const duration = measureSpring({
		fps: 30,
	});
	test('test measureSpring()', () => expect(duration).toBe(28));
	test('spring should be close to 1', () =>
		expect(
			spring({
				fps: 30,
				frame: duration,
			}),
		).toBeCloseTo(1));
	test('spring should not be 1', () =>
		expect(
			spring({
				fps: 30,
				frame: duration - 1,
			}),
		).not.toBe(1));
});

test('Higher threshold should lead to faster spring', () => {
	expect(measureSpring({fps: 30, threshold: 0.05})).toBeLessThan(
		measureSpring({fps: 30, threshold: 0.01}),
	);
});

test('Lower threshold should lead to slower spring', () => {
	expect(measureSpring({fps: 30, threshold: 0.001})).toBeGreaterThan(
		measureSpring({fps: 30, threshold: 0.01}),
	);
});

describe('Threshold edge cases', () => {
	// threshold, expected
	const validEdgeCases: [number, number][] = [
		[0, Infinity],
		[1, 0],
	];
	validEdgeCases.forEach((entry) =>
		test('', () =>
			expect(measureSpring({fps: 30, threshold: entry[0]})).toBe(entry[1])),
	);

	// threshold, errMsg
	const errorEdgeCases: [number | null, RegExp][] = [
		[NaN, /Threshold is NaN/],
		[Infinity, /Threshold is not finite/],
		[null, /threshold must be a number, got null of type object/],
	];

	errorEdgeCases.forEach((entry) =>
		expectToThrow(
			// @ts-expect-error
			() => measureSpring({fps: 30, threshold: entry[0]}),
			entry[1],
		),
	);
});

test('Should throw on invalid FPS', () => {
	expectToThrow(
		() => measureSpring({fps: 0}),
		/"fps" must be positive, but got 0./,
	);
});
