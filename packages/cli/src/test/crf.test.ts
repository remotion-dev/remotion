import type {Codec} from '@remotion/renderer';
import {describe, expect, test} from 'vitest';
import {getActualCrf, setCrf} from '../config/crf';
import {expectToThrow} from './expect-to-throw';

describe('get crf valid input', () => {
	// input crf, input codec, output crf
	const validInputs: [number | undefined, Codec, number][] = [
		[20, 'h264', 20],
		[undefined, 'h264', 18],
		[20, 'h265', 20],
		[undefined, 'h265', 23],
		[20, 'vp8', 20],
		[undefined, 'vp8', 9],
		[20, 'vp9', 20],
		[undefined, 'vp9', 28],
	] as [number | undefined, Codec, number][];
	validInputs.forEach((entry) =>
		test(`test with crf ${entry[0]} and codec ${entry[1]}`, () => {
			setCrf(entry[0]);
			expect(getActualCrf(entry[1])).toEqual(entry[2]);
		})
	);
});

describe('get crf invalid input', () => {
	// input crf, input codec, valid range
	const invalidInputs: [number, Codec, [number, number]][] = [
		[80, 'h264', [1, 51]],
		[80, 'h265', [0, 51]],
		[80, 'vp8', [4, 63]],
		[80, 'vp9', [0, 63]],
	] as [number, Codec, [number, number]][];
	invalidInputs.forEach((entry) =>
		test(`test for ${entry[1]}`, () => {
			setCrf(entry[0]);
			expectToThrow(
				() => getActualCrf(entry[1]),
				new RegExp(
					`CRF must be between ${entry[2][0]} and ${entry[2][1]} for codec ${entry[1]}. Passed: ${entry[0]}`
				)
			);
		})
	);
});

describe('set crf invalid input', () => {
	const invalidInputs = [null, 'abc'];
	invalidInputs.forEach((entry) =>
		test(`test for ${entry}`, () =>
			expectToThrow(
				// @ts-expect-error
				() => setCrf(entry),
				/The CRF must be a number or undefined/
			))
	);
});
