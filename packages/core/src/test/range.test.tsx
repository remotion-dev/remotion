import {setFrameRange, setFrameRangeFromCli} from '../config/frame-range';
import {Internals} from '../internals';
import {expectToThrow} from './expect-to-throw';

test('Frame range should throw exception with invalid inputs', () => {
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
});
test('Frame range tests with valid inputs', () => {
	setFrameRange(null);
	expect(Internals.getRange()).toEqual(null);
	setFrameRange([10, 20]);
	expect(Internals.getRange()).toEqual([10, 20]);
	setFrameRange(10);
	expect(Internals.getRange()).toBe(10);
	setFrameRange(0);
	expect(Internals.getRange()).toBe(0);
});

test('Frame range CLI should throw exception with invalid inputs', () => {
	expectToThrow(
		() => setFrameRangeFromCli('1-2-3'),
		/--frames flag must be a number or 2 numbers separated by '-', instead got 3 numbers/
	);
	expectToThrow(
		() => setFrameRangeFromCli('2-1'),
		/The second number of the --frames flag number should be greater or equal than first number/
	);
	expectToThrow(
		() => setFrameRangeFromCli('one-two'),
		/--frames flag must be a single number, or 2 numbers separated by `-`/
	);
});
test('Frame range CLI tests with valid inputs', () => {
	setFrameRange(null);
	setFrameRangeFromCli(0);
	expect(Internals.getRange()).toEqual(0);
	setFrameRangeFromCli(10);
	expect(Internals.getRange()).toEqual(10);
	setFrameRangeFromCli('1-10');
	expect(Internals.getRange()).toEqual([1, 10]);
});
