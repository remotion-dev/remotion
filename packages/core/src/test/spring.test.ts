import {describe, expect, test} from 'vitest';
import {isApproximatelyTheSame} from '../is-approximately-the-same.js';
import {spring} from '../spring/index.js';

test('Basic spring to equal 0', () => {
	expect(
		spring({
			fps: 30,
			frame: 0,
		})
	).toEqual(0);
});

test('Basic spring to equal 1', () => {
	expect(
		spring({
			fps: 30,
			frame: 0,
			from: 1,
			to: 0,
		})
	).toEqual(1);
});

test('Should be approxmiately the same', () => {
	expect(
		isApproximatelyTheSame(
			spring({
				fps: 30,
				frame: 1,
			}),
			0.04941510804510185
		)
	).toBe(true);
});

test('Should be close to 1', () => {
	expect(
		spring({
			fps: 30,
			frame: 100,
		})
	).toBeCloseTo(1);
});

test('Should be able to set duration for spring', () => {
	expect(
		spring({
			fps: 30,
			frame: 5,
			durationInFrames: 5,
		})
	).toBeCloseTo(1);
});


describe('Should be able to delay a spring', () => {
	test('Should clamp all frames before the delay to zero', () => {
		expect(
			spring({
				fps: 30,
				frame: 0,
				delay: 25,
			})
		).toEqual(0);

		expect(
			spring({
				fps: 30,
				frame: 15,
				delay: 25,
			})
		).toEqual(0);

		expect(
			spring({
				fps: 30,
				frame: 25,
				delay: 25,
			})
		).toEqual(0);
	});

	test('Should start calculations from the delay + 1', () => {
		expect(spring({
			fps: 30,
			frame: 26,
			delay: 25,
		})).toBeGreaterThan(0)
	});

	test('Should be close to 1', () => {
		expect(
			spring({
				fps: 30,
				frame: 25+30,
				delay: 25,
			})
		).toBeCloseTo(1);
	});
})