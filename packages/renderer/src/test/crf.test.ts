import {describe, expect, test} from 'bun:test';
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
			expect(getValidCrfRanges(entry[0])).toEqual(entry[1])),
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
					videoBitrate: null,
					encodingMaxRate: null,
					encodingBufferSize: null,
					hardwareAcceleration: 'if-possible',
				}),
			).not.toThrow()),
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
					videoBitrate: null,
					encodingMaxRate: null,
					encodingBufferSize: null,
					hardwareAcceleration: 'if-possible',
				}),
			).toThrow(
				new RegExp(
					`CRF must be between ${entry[2][0]} and ${entry[2][1]} for codec ${entry[1]}. Passed: ${entry[0]}`,
				),
			)),
	);
});

test('ProRes', () => {
	expect(() =>
		validateQualitySettings({
			crf: 3,
			codec: 'prores',
			videoBitrate: null,
			encodingMaxRate: null,
			encodingBufferSize: null,
			hardwareAcceleration: 'if-possible',
		}),
	).toThrow(/The "prores" codec does not support the --crf option\./);
});

test('WAV', () => {
	expect(() =>
		validateQualitySettings({
			crf: 3,
			codec: 'wav',
			videoBitrate: null,
			encodingMaxRate: null,
			encodingBufferSize: null,
			hardwareAcceleration: 'if-possible',
		}),
	).toThrow(/The "wav" codec does not support the --crf option\./);
});

test('WAV', () => {
	expect(() =>
		validateQualitySettings({
			crf: 10,
			codec: 'h264',
			videoBitrate: '1M',
			encodingMaxRate: null,
			encodingBufferSize: null,
			hardwareAcceleration: 'if-possible',
		}),
	).toThrow(
		/"crf" and "videoBitrate" can not both be set. Choose one of either./,
	);
});

test('encodingMaxRate', () => {
	expect(() =>
		validateQualitySettings({
			crf: 10,
			codec: 'h264',
			videoBitrate: null,
			encodingMaxRate: '1M',
			encodingBufferSize: null,
			hardwareAcceleration: 'if-possible',
		}),
	).toThrow(
		/"encodingMaxRate" can not be set without also setting "encodingBufferSize"./,
	);
});

describe('crf tests getValidCrfRanges invalid input', () => {
	// input codec
	const invalidInputs = ['abc', '', 3, undefined];
	invalidInputs.forEach((entry) =>
		test(`testing with "${entry}"`, () =>
			expect(
				// @ts-expect-error
				() => getValidCrfRanges(entry),
			).toThrow(new RegExp(`Got unexpected codec "${entry}"`))),
	);
});

describe('crf tests getDefaultCrfForCodec invalid input', () => {
	// input codec
	const invalidCodecs = ['abc', '', 3, undefined];
	invalidCodecs.forEach((entry) =>
		test(`testing with ${entry}`, () =>
			expect(
				// @ts-expect-error
				() => getDefaultCrfForCodec(entry),
			).toThrow(new RegExp(`Got unexpected codec "${entry}"`))),
	);
});
