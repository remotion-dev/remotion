import {describe, expect, test} from 'vitest';
import type {Codec} from '../codec';
import {
	getDefaultCrfForCodec,
	getValidCrfRanges,
	validateQualitySettings,
} from '../crf';

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
				validateQualitySettings({
					crf: entry[0],
					codec: entry[1],
					videoBitrate: undefined,
				})
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
			expect(() =>
				validateQualitySettings({
					crf: entry[0],
					codec: entry[1],
					videoBitrate: undefined,
				})
			).toThrow(
				new RegExp(
					`CRF must be between ${entry[2][0]} and ${entry[2][1]} for codec ${entry[1]}. Passed: ${entry[0]}`
				)
			))
	);
});

test('ProRes', () => {
	expect(() =>
		validateQualitySettings({crf: 3, codec: 'prores', videoBitrate: undefined})
	).toThrow(/The "prores" codec does not support the --crf option\./);
});

test('WAV', () => {
	expect(() =>
		validateQualitySettings({crf: 3, codec: 'wav', videoBitrate: undefined})
	).toThrow(/The "wav" codec does not support the --crf option\./);
});

test('WAV', () => {
	expect(() =>
		validateQualitySettings({crf: 10, codec: 'h264', videoBitrate: '1M'})
	).toThrow(
		/"crf" and "videoBitrate" can not both be set. Choose one of either./
	);
});

describe('crf tests getValidCrfRanges invalid input', () => {
	// input codec
	const invalidInputs = ['abc', '', 3, undefined];
	invalidInputs.forEach((entry) =>
		test(`testing with "${entry}"`, () =>
			expect(
				// @ts-expect-error
				() => getValidCrfRanges(entry)
			).toThrow(new RegExp(`Got unexpected codec "${entry}"`)))
	);
});

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
			expect(
				// @ts-expect-error
				() => getDefaultCrfForCodec(entry)
			).toThrow(new RegExp(`Got unexpected codec "${entry}"`)))
	);
});
