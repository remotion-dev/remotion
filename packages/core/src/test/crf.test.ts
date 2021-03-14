import {
	getActualCrf,
	getDefaultCrfForCodec,
	getValidCrfRanges,
	setCrf,
	validateSelectedCrfAndCodecCombination,
} from '../config/crf';
import {expectToThrow} from './expect-to-throw';

test('crf tests getDefaultCrfForCodec', () => {
	// input codec, output
	const valuesA = [
		['h264', 18],
		['h265', 23],
		['vp8', 9],
		['vp9', 28],
	];
	valuesA.forEach((entry) =>
		// @ts-expect-error
		expect(getDefaultCrfForCodec(entry[0])).toEqual(entry[1])
	);

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

test('crf tests getValidCrfRanges', () => {
	// input crf, input codec, valid range
	const valuesA = [
		['h264', [0, 51]],
		['h265', [0, 51]],
		['vp8', [4, 63]],
		['vp9', [0, 63]],
	];
	valuesA.forEach((entry) =>
		// @ts-expect-error
		expect(getValidCrfRanges(entry[0])).toEqual(entry[1])
	);

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

test('validateSelectedCrfAndCodecCombination', () => {
	// input crf, input codec
	const valuesA = [
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
	];
	valuesA.forEach((entry) =>
		expect(
			// @ts-expect-error
			() => validateSelectedCrfAndCodecCombination(entry[0], entry[1])
		).not.toThrow()
	);

	// input crf, input codec, valid range
	const valuesB = [
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
	];
	valuesB.forEach((entry) =>
		expectToThrow(
			// @ts-expect-error
			() => validateSelectedCrfAndCodecCombination(entry[0], entry[1]),
			new RegExp(
				// @ts-expect-error
				`CRF must be between ${entry[2][0]} and ${entry[2][1]} for codec ${entry[1]}. Passed: ${entry[0]}`
			)
		)
	);
});

test('get crf', () => {
	// input crf, input codec, output crf
	const valuesA = [
		[20, 'h264', 20],
		[undefined, 'h264', 18],
		[100, 'h264', 18],
		[20, 'h265', 20],
		[undefined, 'h265', 23],
		[100, 'h265', 23],
		[20, 'vp8', 20],
		[undefined, 'vp8', 9],
		[100, 'vp8', 9],
		[20, 'vp9', 20],
		[undefined, 'vp9', 28],
		[100, 'vp9', 28],
	];
	valuesA.forEach((entry) => {
		// @ts-expect-error
		setCrf(entry[0]);
		expect(
			// @ts-expect-error
			getActualCrf(entry[1])
		).toEqual(entry[2]);
	});
});
