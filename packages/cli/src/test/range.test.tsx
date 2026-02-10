import {RenderInternals} from '@remotion/renderer';
import {describe, expect, test} from 'bun:test';
import {
	getRange,
	setFrameRange,
	setFrameRangeFromCli,
} from '../config/frame-range';
import {expectToThrow} from './expect-to-throw';

describe('Frame range should throw exception with invalid inputs', () => {
	const testValues: [number | [number, number] | null, RegExp][] = [
		[-1, /non-negative/],
		[1.111, /Frame must be an integer, but got a float \(1.111\)/],
		[Infinity, /finite number, got Infinity/],
		// @ts-expect-error
		[[0, 2, 4], /Frame range must be a tuple, got an array with length 3/],
		// @ts-expect-error
		[[], /Frame range must be a tuple, got an array with length 0/],
		[
			// @ts-expect-error
			['0', 2],
			/The first value of frame range must be a number, but got string \("0"\)/,
		],
		[
			[0.111, 2],
			/The first value of frame range must be an integer, but got a float \(0.111\)/,
		],
		[
			[0, Infinity],
			/The second value of frame range must be finite, but got Infinity/,
		],
		[
			[-1, 0],
			/The first value of frame range must be non-negative, but got -1/,
		],
		[
			[10, 0],
			/The second value of frame range must be not smaller than the first one, but got 10-0/,
		],
		[
			// @ts-expect-error
			'10',
			/Frame range must be a number or a tuple of numbers, but got object of type string/,
		],
	];

	testValues.forEach((entry) =>
		test(`test with input ${JSON.stringify(entry[0])}`, () =>
			expectToThrow(() => setFrameRange(entry[0]), entry[1])),
	);
});
describe('Frame range tests with valid inputs', () => {
	const testValues: (number | [number, number] | [number, null] | null)[] = [
		null,
		[10, 20],
		[10, 10],
		[10, null],
		[0, null],
		10,
		0,
	];
	testValues.forEach((entry) =>
		test(`test with input ${JSON.stringify(entry)}`, () => {
			setFrameRange(entry);
			expect(getRange()).toEqual(entry);
		}),
	);
});

describe('Frame range CLI should throw exception with invalid inputs', () => {
	const testValues: [string, RegExp][] = [
		[
			'1-2-3',
			/--frames flag must be a number or 2 numbers separated by '-', instead got 3 numbers/,
		],
		[
			'2-1',
			/The second number of the --frames flag number should be greater or equal than first number/,
		],
		[
			'one-two',
			/--frames flag must be a single number, or 2 numbers separated by `-`/,
		],
		[
			' ',
			/--frames flag must be a single number, or 2 numbers separated by `-`/,
		],
		[
			'',
			/--frames flag must be a single number, or 2 numbers separated by `-`/,
		],
	];
	testValues.forEach((entry) =>
		test(`test with input ${entry[0]}`, () =>
			expectToThrow(() => setFrameRangeFromCli(entry[0]), entry[1])),
	);
});
describe('Frame range CLI tests with valid inputs', () => {
	setFrameRange(null);

	const testValues: [
		number | string,
		number | [number, number] | [number, null],
	][] = [
		[0, 0],
		[10, 10],
		['1-10', [1, 10]],
		['10-10', [10, 10]],
		['-', [0, 0]],
		// Open-ended ranges
		['1920-', [1920, null]],
		['0-', [0, null]],
		[-1920, [0, 1920]],
	];
	testValues.forEach((entry) =>
		test(`test with input ${JSON.stringify(entry[0])}`, () => {
			setFrameRangeFromCli(entry[0]);
			expect(getRange()).toEqual(entry[1]);
		}),
	);
});

describe('getRealFrameRange resolves open-ended ranges', () => {
	test('resolves [number, null] to [number, durationInFrames - 1]', () => {
		expect(RenderInternals.getRealFrameRange(3600, [1920, null])).toEqual([
			1920, 3599,
		]);
	});

	test('resolves [0, null] to full range', () => {
		expect(RenderInternals.getRealFrameRange(3600, [0, null])).toEqual([
			0, 3599,
		]);
	});

	test('resolves normal range unchanged', () => {
		expect(RenderInternals.getRealFrameRange(3600, [10, 20])).toEqual([10, 20]);
	});

	test('resolves null to full range', () => {
		expect(RenderInternals.getRealFrameRange(3600, null)).toEqual([0, 3599]);
	});
});
