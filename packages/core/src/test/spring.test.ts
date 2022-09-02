import {expect, test} from 'vitest';
import {isApproximatelyTheSame} from '../is-approximately-the-same';
import {spring} from '../spring';

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
