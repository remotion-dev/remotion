import {Codec} from '../config';
import {
	getActualCrf,
	getDefaultCrfForCodec,
	getValidCrfRanges,
	setCrf,
	validateSelectedCrfAndCodecCombination,
} from '../config/crf';
import {expectToThrow} from './expect-to-throw';

test('crf tests getDefaultCrfForCodec valid input', () => {
	// input codec, output
	const valuesA: [Codec, number][] = [
		['h264', 18],
		['h265', 23],
		['vp8', 9],
		['vp9', 28],
	] as [Codec, number][];
	valuesA.forEach((entry) =>
		expect(getDefaultCrfForCodec(entry[0])).toEqual(entry[1])
	);
});

test('crf tests getDefaultCrfForCodec invalid input', () => {
	// input codec
	const valuesB = ['abc', '', 3, undefined];
	valuesB.forEach((entry) =>
		expectToThrow(
			// @ts-expect-error
			() => getDefaultCrfForCodec(entry),
			new RegExp(`Got unexpected codec "${entry}"`)
		)
	);
});

test('crf tests getValidCrfRanges valid input', () => {
	// input crf, input codec, valid range
	const valuesA: [Codec, [number, number]][] = [
		['h264', [0, 51]],
		['h265', [0, 51]],
		['vp8', [4, 63]],
		['vp9', [0, 63]],
	] as [Codec, [number, number]][];
	valuesA.forEach((entry) =>
		expect(getValidCrfRanges(entry[0])).toEqual(entry[1])
	);
});

test('crf tests getValidCrfRanges invalid input', () => {
	// input codec
	const valuesB = ['abc', '', 3, undefined];
	valuesB.forEach((entry) =>
		expectToThrow(
			// @ts-expect-error
			() => getValidCrfRanges(entry),
			new RegExp(`Got unexpected codec "${entry}"`)
		)
	);
});

test('validateSelectedCrfAndCodecCombination valid input', () => {
	// input crf, input codec
	const valuesA: [number, Codec][] = [
		[20, 'h264'],
		[0, 'h264'],
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
	valuesA.forEach((entry) =>
		expect(() =>
			validateSelectedCrfAndCodecCombination(entry[0], entry[1])
		).not.toThrow()
	);
});

test('validateSelectedCrfAndCodecCombination invalid input', () => {
	// input crf, input codec, valid range
	const valuesB: [number, Codec, [number, number]][] = [
		[80, 'h264', [0, 51]],
		[-1, 'h264', [0, 51]],
		[52, 'h264', [0, 51]],
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
	valuesB.forEach((entry) =>
		expectToThrow(
			() => validateSelectedCrfAndCodecCombination(entry[0], entry[1]),
			new RegExp(
				`CRF must be between ${entry[2][0]} and ${entry[2][1]} for codec ${entry[1]}. Passed: ${entry[0]}`
			)
		)
	);
});

test('get crf valid input', () => {
	// input crf, input codec, output crf
	const valuesA: [number | undefined, Codec, number][] = [
		[20, 'h264', 20],
		[undefined, 'h264', 18],
		[20, 'h265', 20],
		[undefined, 'h265', 23],
		[20, 'vp8', 20],
		[undefined, 'vp8', 9],
		[20, 'vp9', 20],
		[undefined, 'vp9', 28],
	] as [number | undefined, Codec, number][];
	valuesA.forEach((entry) => {
		setCrf(entry[0]);
		expect(getActualCrf(entry[1])).toEqual(entry[2]);
	});
});

test('get crf invalid input', () => {
	// input crf, input codec, valid range
	const valuesB: [number, Codec, [number, number]][] = [
		[80, 'h264', [0, 51]],
		[80, 'h265', [0, 51]],
		[80, 'vp8', [4, 63]],
		[80, 'vp9', [0, 63]],
	] as [number, Codec, [number, number]][];
	valuesB.forEach((entry) => {
		setCrf(entry[0]);
		expectToThrow(
			() => getActualCrf(entry[1]),
			new RegExp(
				`CRF must be between ${entry[2][0]} and ${entry[2][1]} for codec ${entry[1]}. Passed: ${entry[0]}`
			)
		);
	});
});
