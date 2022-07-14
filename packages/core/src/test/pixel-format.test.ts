import {describe, expect, test} from 'vitest';
import type {Codec} from '../config';
import type {PixelFormat} from '../config/pixel-format';
import {
	getPixelFormat,
	setPixelFormat,
	validateSelectedPixelFormatAndCodecCombination,
} from '../config/pixel-format';
import {expectToThrow} from './expect-to-throw';

describe('pixel-format tests setPixelFormat', () => {
	// input format
	const validPixelFormats: PixelFormat[] = [
		'yuv420p',
		'yuva420p',
		'yuv422p',
		'yuv444p',
		'yuv420p10le',
		'yuv422p10le',
		'yuv444p10le',
	];
	validPixelFormats.forEach((entry) =>
		test(`test for ${entry}`, () => {
			setPixelFormat(entry);
			expect(getPixelFormat()).toEqual(entry);
		})
	);

	// input format
	const invalidPixelFormats = ['abc', '', 3, undefined];
	invalidPixelFormats.forEach((entry) =>
		test(`test for invalid input ${entry}`, () =>
			expectToThrow(
				// @ts-expect-error
				() => setPixelFormat(entry),
				new RegExp(`Value ${entry} is not valid as a pixel format.`)
			))
	);
});

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
					validateSelectedPixelFormatAndCodecCombination(format, codec)
				).not.toThrow();
			});
		}
	}

	const invalidCodecs: Codec[] = ['h264', 'h265'];
	invalidCodecs.forEach((entry) =>
		test(`test for invalid combination yuva420p and ${entry}`, () =>
			expectToThrow(
				() => validateSelectedPixelFormatAndCodecCombination('yuva420p', entry),
				/Pixel format was set to 'yuva420p' but codec is not 'vp8' or 'vp9'. To render videos with alpha channel, you must choose a codec that supports it./
			))
	);
	const validCodecs: Codec[] = ['vp8', 'vp9'];
	validCodecs.forEach((c) =>
		test(`test for valid combination yuva420p and ${c}`, () =>
			expect(() =>
				validateSelectedPixelFormatAndCodecCombination('yuva420p', c)
			).not.toThrow())
	);

	const invalidFormats = ['abc', '', 3];
	invalidFormats.forEach((entry) =>
		test(`test for invalid input "${entry}"`, () =>
			expectToThrow(
				// @ts-expect-error
				() => validateSelectedPixelFormatAndCodecCombination(entry, 'h264'),
				new RegExp(`Value ${entry} is not valid as a pixel format.`)
			))
	);
});
