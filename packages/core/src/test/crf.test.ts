import {describe, expect, test} from 'vitest';
import type {Codec} from '../config';
import {
	getActualCrf,
	getDefaultCrfForCodec,
	getValidCrfRanges,
	setCrf,
	validateSelectedCrfAndCodecCombination,
} from '../config/crf';
import {expectToThrow} from './expect-to-throw';

describe('crf tests getDefaultCrfForCodec valid input', () => {
	// input codec, output
	const validCodecIOs: [Codec, number][] = [
		['h264', 18],
		['h265', 23],
		['vp8', 9],
		['vp9', 28],
		['mp3', 0],
		['aac', 0],
		['wav', 0],
	] as [Codec, number][];
	validCodecIOs.forEach((entry) =>
		test(`default for ${entry[0]} should be ${entry[1]}`, () =>
			expect(getDefaultCrfForCodec(entry[0])).toEqual(entry[1]))
	);
});

describe('crf tests getDefaultCrfForCodec invalid input', () => {
	// input codec
	const invalidCodecs = ['abc', '', 3, undefined];
	invalidCodecs.forEach((entry) =>
		test(`testing with ${entry}`, () =>
			expectToThrow(
				// @ts-expect-error
				() => getDefaultCrfForCodec(entry),
				new RegExp(`Got unexpected codec "${entry}"`)
			))
	);
});

describe('crf tests getValidCrfRanges valid input', () => {
	// input crf, input codec, valid range
	const validInputs: [Codec, [number, number]][] = [
		['h264', [1, 51]],
		['h265', [0, 51]],
		['vp8', [4, 63]],
		['vp9', [0, 63]],
		['mp3', [0, 0]],
		['aac', [0, 0]],
		['wav', [0, 0]],
	] as [Codec, [number, number]][];
	validInputs.forEach((entry) =>
		test(`valid range for ${entry[0]} should be [${entry[1]}]`, () =>
			expect(getValidCrfRanges(entry[0])).toEqual(entry[1]))
	);
});

describe('crf tests getValidCrfRanges invalid input', () => {
	// input codec
	const invalidInputs = ['abc', '', 3, undefined];
	invalidInputs.forEach((entry) =>
		test(`testing with "${entry}"`, () =>
			expectToThrow(
				// @ts-expect-error
				() => getValidCrfRanges(entry),
				new RegExp(`Got unexpected codec "${entry}"`)
			))
	);
});

describe('validateSelectedCrfAndCodecCombination valid input', () => {
	// input crf, input codec
	const validInputs: [number, Codec][] = [
		[20, 'h264'],
		[1, 'h264'],
		[51, 'h264'],
		[20, 'h265'],
		[0, 'h265'],
		[51, 'h265'],
		[20, 'vp8'],
		[4, 'vp8'],
		[63, 'vp8'],
		[20, 'vp9'],
		[0, 'vp9'],
		[63, 'vp9'],
	] as [number, Codec][];
	validInputs.forEach((entry) =>
		test(`validate with crf ${entry[0]} and codec ${entry[1]}`, () =>
			expect(() =>
				validateSelectedCrfAndCodecCombination(entry[0], entry[1])
			).not.toThrow())
	);
});

describe('validateSelectedCrfAndCodecCombination invalid input', () => {
	// input crf, input codec, valid range
	const invalidInputs: [number, Codec, [number, number]][] = [
		[80, 'h264', [1, 51]],
		[-1, 'h264', [1, 51]],
		[52, 'h264', [1, 51]],
		[80, 'h265', [0, 51]],
		[-1, 'h265', [0, 51]],
		[52, 'h265', [0, 51]],
		[80, 'vp8', [4, 63]],
		[3, 'vp8', [4, 63]],
		[64, 'vp8', [4, 63]],
		[80, 'vp9', [0, 63]],
		[-1, 'vp9', [0, 63]],
		[64, 'vp9', [0, 63]],
	] as [number, Codec, [number, number]][];
	invalidInputs.forEach((entry) =>
		test(`validate with crf ${entry[0]} and codec ${entry[1]}`, () =>
			expectToThrow(
				() => validateSelectedCrfAndCodecCombination(entry[0], entry[1]),
				new RegExp(
					`CRF must be between ${entry[2][0]} and ${entry[2][1]} for codec ${entry[1]}. Passed: ${entry[0]}`
				)
			))
	);
});

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
