import type {PixelFormat} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {describe, expect, test} from 'bun:test';
import {expectToThrow} from './expect-to-throw';

const {pixelFormatOption} = BrowserSafeApis.options;

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
			pixelFormatOption.setConfig(entry);
			expect(pixelFormatOption.getValue({commandLine: {}}).value).toEqual(
				entry,
			);
		}),
	);

	// input format
	const invalidPixelFormats = ['abc', '', 3, undefined];
	invalidPixelFormats.forEach((entry) =>
		test(`test for invalid input ${entry}`, () =>
			expectToThrow(
				// @ts-expect-error
				() => pixelFormatOption.setConfig(entry),
				new RegExp(`Value ${entry} is not valid as a pixel format.`),
			)),
	);
});
