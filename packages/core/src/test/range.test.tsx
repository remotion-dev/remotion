import {setFrameRange} from '../config/frame-range';
import {Internals} from '../internals';
import {expectToThrow} from './expect-to-throw';

test('Frame range tests', () => {
	expectToThrow(() => setFrameRange(-1), /non-negative/);
	expectToThrow(
		() => setFrameRange(1.111),
		/Frame must be an integer, but got a float \(1.111\)/
	);
	expectToThrow(() => setFrameRange(Infinity), /finite number, got Infinity/);
	expectToThrow(
		// @ts-expect-error
		() => setFrameRange([0, 2, 4]),
		/Frame range must be a tuple, got an array with length 3/
	);
	expectToThrow(
		// @ts-expect-error
		() => setFrameRange([]),
		/Frame range must be a tuple, got an array with length 0/
	);
	expectToThrow(
		// @ts-expect-error
		() => setFrameRange(['0', 2]),
		/Each value of frame range must be a number, but got string \("0"\)/
	);
	expectToThrow(
		() => setFrameRange([0.111, 2]),
		/Each value of frame range must be an integer, but got a float \(0.111\)/
	);
	expectToThrow(
		() => setFrameRange([0, Infinity]),
		/Each value of frame range must be finite, but got Infinity/
	);
	expectToThrow(
		() => setFrameRange([-1, 0]),
		/Each value of frame range must be non-negative, but got -1/
	);
	expectToThrow(
		() => setFrameRange([10, 0]),
		/The second value of frame range must be not smaller than the first one, but got 10-0/
	);
	expectToThrow(
		// @ts-expect-error
		() => setFrameRange('10'),
		/Frame range must be a number or a tuple of numbers, but got object of type string/
	);
	setFrameRange(null);
	expect(Internals.getRange()).toEqual(null);
	setFrameRange([10, 20]);
	expect(Internals.getRange()).toEqual([10, 20]);
});
