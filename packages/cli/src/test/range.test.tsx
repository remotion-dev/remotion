import {describe, expect, test} from 'bun:test';
import type {FrameSelection} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {expectToThrow} from './expect-to-throw';

const {framesOption} = BrowserSafeApis.options;

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
			expectToThrow(() => framesOption.setConfig(entry[0]), entry[1])),
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
			framesOption.setConfig(entry);
			expect(framesOption.getValue({commandLine: {}}).value).toEqual(entry);
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
			/--frames flag must be a frame number, range, or comma-separated selection/,
		],
		[
			' ',
			/--frames flag must be a single number, or 2 numbers separated by `-`/,
		],
		[
			'',
			/--frames flag must be a single number, or 2 numbers separated by `-`/,
		],
		['0,2,2', /must not contain duplicate frames/],
		['0,two,4', /must contain only finite numbers/],
		['0,-2,4', /Invalid frame selector/],
		['0,,4', /must contain a frame or frame range between commas/],
		['0-4,4-8', /must be ordered and non-overlapping/],
		['10-,20-30', /open-ended frame range must be the last range/],
	];
	testValues.forEach((entry) =>
		test(`test with input ${entry[0]}`, () =>
			expectToThrow(
				() => framesOption.getValue({commandLine: {frames: entry[0]}}),
				entry[1],
			)),
	);
});
describe('Frame range CLI tests with valid inputs', () => {
	framesOption.setConfig(null);

	const testValues: [number | string, Exclude<FrameSelection, null>][] = [
		[0, 0],
		[10, 10],
		['1-10', [1, 10]],
		['10-10', [10, 10]],
		['-', [0, 0]],
		// Open-ended ranges
		['1920-', [1920, null]],
		['0-', [0, null]],
		[-1920, [0, 1920]],
		['8,2,5', {type: 'frames', frames: [2, 5, 8]}],
		[
			'0-4,10-14',
			[
				[0, 4],
				[10, 14],
			],
		],
		[
			'0,4-6,10-',
			[
				[0, 0],
				[4, 6],
				[10, null],
			],
		],
	];
	testValues.forEach((entry) =>
		test(`test with input ${JSON.stringify(entry[0])}`, () => {
			expect(
				framesOption.getValue({commandLine: {frames: entry[0]}}).value,
			).toEqual(entry[1]);
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

	test('throws if open-ended start is beyond composition duration', () => {
		expect(() => RenderInternals.getRealFrameRange(3600, [5000, null])).toThrow(
			/not inbetween/,
		);
	});
});

describe('getRealFrameRanges resolves multiple ranges', () => {
	test('resolves open-ended ranges and expands the selected frames', () => {
		const ranges = RenderInternals.getRealFrameRanges(20, [
			[0, 2],
			[10, null],
		]);
		expect(ranges).toEqual([
			[0, 2],
			[10, 19],
		]);
		expect(RenderInternals.getFramesToRender(ranges, 1)).toEqual([
			0, 1, 2, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
		]);
	});
});
