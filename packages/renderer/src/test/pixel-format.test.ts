import {describe, expect, test} from 'bun:test';
import type {Codec} from '../codec';
import type {PixelFormat} from '../pixel-format';
import {validateSelectedPixelFormatAndCodecCombination} from '../pixel-format';

describe('pixel-format tests validateSelectedPixelFormatAndCodecCombination', () => {
	const formats: PixelFormat[] = [
		'yuv420p',
		'yuv422p',
		'yuv444p',
		'yuv420p10le',
		'yuv422p10le',
		'yuv444p10le',
	];

	const codecs: Codec[] = ['h264', 'h265', 'vp8', 'vp9'];

	for (const format of formats) {
		for (const codec of codecs) {
			test(`test for valid combination ${format} and ${codec}`, () => {
				expect(() =>
					validateSelectedPixelFormatAndCodecCombination(format, codec),
				).not.toThrow();
			});
		}
	}

	test(`test for invalid combination yuva420p and h264`, () =>
		expect(() =>
			validateSelectedPixelFormatAndCodecCombination('yuva420p', 'h264'),
		).toThrow(
			/Pixel format was set to 'yuva420p' but codec h264 does not support it. Valid pixel formats for codec h264 are: yuv420p, yuv422p, yuv444p, yuv420p10le, yuv422p10le, yuv444p10le, yuva444p10le./g,
		));
	const validCodecs: Codec[] = ['vp8', 'vp9'];
	validCodecs.forEach((c) =>
		test(`test for valid combination yuva420p and ${c}`, () =>
			expect(() =>
				validateSelectedPixelFormatAndCodecCombination('yuva420p', c),
			).not.toThrow()),
	);

	const invalidFormats = ['abc', '', 3];
	invalidFormats.forEach((entry) =>
		test(`test for invalid input "${entry}"`, () =>
			expect(
				// @ts-expect-error
				() => validateSelectedPixelFormatAndCodecCombination(entry, 'h264'),
			).toThrow(new RegExp(`Value ${entry} is not valid as a pixel format.`))),
	);
});
