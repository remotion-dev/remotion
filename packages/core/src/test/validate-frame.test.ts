import {expect, test} from 'vitest';
import {validateFrame} from '../validation/validate-frame';
import {expectToThrow} from './expect-to-throw';

test('Validate frame', () => {
	expectToThrow(() => validateFrame(-1, 100), /Frame -1 cannot be negative/);
	expectToThrow(
		() => validateFrame(Infinity, 100),
		/Frame Infinity is not finite/
	);
	expectToThrow(
		// @ts-expect-error
		() => validateFrame('hithere', 100),
		/Argument passed for "frame" is not a number: hithere/
	);
	expectToThrow(
		() => validateFrame(3, 1),
		/Cannot use frame 3: Duration of composition is 1, therefore the highest frame that can be rendered is 0/
	);
	expectToThrow(
		() => validateFrame(2.99, 10),
		/Argument for frame must be an integer, but got 2.99/
	);
	expect(() => validateFrame(0, 1)).not.toThrow();
	expect(() => validateFrame(1, 2)).not.toThrow();
});
