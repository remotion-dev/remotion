import {Internals} from 'remotion';
import {expect, test} from 'vitest';

test('Validate frame', () => {
	expect(() =>
		Internals.validateFrame({
			durationInFrames: Infinity,
			frame: 100,
			allowFloats: false,
		})
	).toThrow(/Frame Infinity is not finite/);
	expect(() =>
		Internals.validateFrame({
			// @ts-expect-error
			frame: 'hithere',
			allowFloats: false,
			durationInFrames: 100,
		})
	).toThrow(/Argument passed for "frame" is not a number: hithere/);
	expect(() =>
		Internals.validateFrame({frame: 3, durationInFrames: 1, allowFloats: true})
	).toThrow(
		/Cannot use frame 3: Duration of composition is 1, therefore the highest frame that can be rendered is 0/
	);
	expect(() =>
		Internals.validateFrame({
			frame: 2.99,
			durationInFrames: 10,
			allowFloats: false,
		})
	).toThrow(/Argument for frame must be an integer, but got 2.99/);
	expect(() =>
		Internals.validateFrame({
			frame: 2.99,
			durationInFrames: 10,
			allowFloats: true,
		})
	).not.toThrow();

	expect(() =>
		Internals.validateFrame({frame: 0, durationInFrames: 1, allowFloats: false})
	).not.toThrow();
	expect(() =>
		Internals.validateFrame({frame: 1, durationInFrames: 2, allowFloats: false})
	).not.toThrow();
	expect(() =>
		Internals.validateFrame({
			frame: -1,
			durationInFrames: 100,
			allowFloats: false,
		})
	).not.toThrow();
	expect(() =>
		Internals.validateFrame({
			frame: -100,
			durationInFrames: 100,
			allowFloats: false,
		})
	).not.toThrow();
	expect(() =>
		Internals.validateFrame({
			frame: -101,
			durationInFrames: 100,
			allowFloats: false,
		})
	).toThrow(
		/Cannot use frame -101: Duration of composition is 100, therefore the lowest frame that can be rendered is -100/
	);
});
