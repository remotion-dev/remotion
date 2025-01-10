import {describe, expect, test} from 'bun:test';
import {isApproximatelyTheSame} from '../is-approximately-the-same';
import {spring} from '../spring/index';
import {measureSpring} from '../spring/measure-spring';

test('Basic spring to equal 0', () => {
	expect(
		spring({
			fps: 30,
			frame: 0,
		}),
	).toEqual(0);
});

test('Basic spring to equal 1', () => {
	expect(
		spring({
			fps: 30,
			frame: 0,
			from: 1,
			to: 0,
		}),
	).toEqual(1);
});

test('Should be approxmiately the same', () => {
	expect(
		isApproximatelyTheSame(
			spring({
				fps: 30,
				frame: 1,
			}),
			0.04941510804510185,
		),
	).toBe(true);
});

test('Should be close to 1', () => {
	expect(
		spring({
			fps: 30,
			frame: 100,
		}),
	).toBeCloseTo(1);
});

test('Should be able to set duration for spring', () => {
	expect(
		spring({
			fps: 30,
			frame: 5,
			durationInFrames: 5,
		}),
	).toBeCloseTo(1);
});

// Reverse tests
test('Should be able to set duration for spring when in reverse', () => {
	expect(
		spring({
			fps: 30,
			frame: 5,
			durationInFrames: 5,
			reverse: true,
		}),
	).toBeCloseTo(0);
	expect(
		spring({
			fps: 30,
			frame: 0,
			durationInFrames: 5,
			reverse: true,
		}),
	).toBeCloseTo(1);
});

test('Should be able to set duration for spring when in reverse', () => {
	expect(
		spring({
			fps: 30,
			frame: 0,
			durationInFrames: 5,
			reverse: true,
		}),
	).toBeCloseTo(1);
});

// This is the reverse of one of the first tests
test('Should be approxmiately the same when in reverse', () => {
	expect(
		spring({
			fps: 30,
			// duration - 1
			frame: measureSpring({fps: 30}) - 1,
			reverse: true,
		}),
	).toBeCloseTo(0.04941510804510185);
});

test('Should be close to 0 when in reverse', () => {
	expect(
		spring({
			fps: 30,
			frame: 100,
			reverse: true,
		}),
	).toBeCloseTo(0);
});

describe('Should be able to delay a spring', () => {
	test('Should clamp all frames before the delay to zero', () => {
		expect(
			spring({
				fps: 30,
				frame: 0,
				delay: 25,
			}),
		).toEqual(0);

		expect(
			spring({
				fps: 30,
				frame: 15,
				delay: 25,
			}),
		).toEqual(0);

		expect(
			spring({
				fps: 30,
				frame: 25,
				delay: 25,
			}),
		).toEqual(0);
	});

	test('Should start calculations from the delay + 1', () => {
		expect(
			spring({
				fps: 30,
				frame: 26,
				delay: 25,
			}),
		).toBeGreaterThan(0);
	});

	test('Should be close to 1', () => {
		expect(
			spring({
				fps: 30,
				frame: 25 + 30,
				delay: 25,
			}),
		).toBeCloseTo(1);
	});
});

test('Should apply delay in the right order', () => {
	expect(
		spring({
			fps: 30,
			frame: 61,
			delay: 60,
			durationInFrames: 10,
		}),
	).toBe(
		spring({
			fps: 30,
			frame: 1,
			delay: 0,
			durationInFrames: 10,
		}),
	);
});

test('weird case', () => {
	const val = spring({
		fps: 30,
		frame: 12 * 30,
		config: {
			damping: 200,
		},
		delay: 12 * 30,
		durationInFrames: 60,
		reverse: true,
	});

	expect(val).toBeCloseTo(1);

	const val2 = spring({
		fps: 30,
		frame: 12 * 30 + 60,
		config: {
			damping: 200,
		},
		delay: 12 * 30,
		durationInFrames: 60,
		reverse: true,
	});

	expect(val2).toBeCloseTo(0);
});

test('spring should not end too early', () => {
	expect(
		spring({
			fps: 30,
			frame: 9,
			config: {
				damping: 200,
			},
			durationInFrames: 10,
		}),
	).toBeLessThan(1);
	expect(
		spring({
			fps: 30,
			frame: 10,
			config: {
				damping: 200,
			},
			durationInFrames: 10,
		}),
	).toBeCloseTo(1);
});

test('from / to', () => {
	expect(
		spring({
			fps: 30,
			frame: 10,
			from: 0,
			to: 200,
			config: {
				damping: 200,
			},
		}),
	).toBeCloseTo(169.082);
});
