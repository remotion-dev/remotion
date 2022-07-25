import {expect, test} from 'vitest';
import {validateFrame} from '../validate-frame';

test('Validate frame', () => {
	expect(() => validateFrame(-1, 100)).toThrow(/Frame -1 cannot be negative/);
	expect(() => validateFrame(Infinity, 100)).toThrow(
		/Frame Infinity is not finite/
	);
	expect(
		// @ts-expect-error
		() => validateFrame('hithere', 100)
	).toThrow(/Argument passed for "frame" is not a number: hithere/);
	expect(() => validateFrame(3, 1)).toThrow(
		/Cannot use frame 3: Duration of composition is 1, therefore the highest frame that can be rendered is 0/
	);
	expect(() => validateFrame(2.99, 10)).toThrow(
		/Argument for frame must be an integer, but got 2.99/
	);
	expect(() => validateFrame(0, 1)).not.toThrow();
	expect(() => validateFrame(1, 2)).not.toThrow();
});
