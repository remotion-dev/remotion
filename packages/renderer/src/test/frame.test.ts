import {Internals} from 'remotion';
import {expect, test} from 'vitest';

test('Validate frame', () => {
	expect(() => Internals.validateFrame(Infinity, 100)).toThrow(
		/Frame Infinity is not finite/
	);
	expect(
		// @ts-expect-error
		() => Internals.validateFrame('hithere', 100)
	).toThrow(/Argument passed for "frame" is not a number: hithere/);
	expect(() => Internals.validateFrame(3, 1)).toThrow(
		/Cannot use frame 3: Duration of composition is 1, therefore the highest frame that can be rendered is 0/
	);
	expect(() => Internals.validateFrame(2.99, 10)).toThrow(
		/Argument for frame must be an integer, but got 2.99/
	);
	expect(() => Internals.validateFrame(0, 1)).not.toThrow();
	expect(() => Internals.validateFrame(1, 2)).not.toThrow();
	expect(() => Internals.validateFrame(-1, 100)).not.toThrow();
	expect(() => Internals.validateFrame(-100, 100)).not.toThrow();
	expect(() => Internals.validateFrame(-101, 100)).toThrow(
		/Cannot use frame -101: Duration of composition is 100, therefore the lowest frame that can be rendered is -100/
	);
});
