import type {PixelFormat} from '@remotion/renderer';
import {describe, expect, test} from 'bun:test';
import {getPixelFormat, setPixelFormat} from '../config/pixel-format';
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
		}),
	);

	// input format
	const invalidPixelFormats = ['abc', '', 3, undefined];
	invalidPixelFormats.forEach((entry) =>
		test(`test for invalid input ${entry}`, () =>
			expectToThrow(
				// @ts-expect-error
				() => setPixelFormat(entry),
				new RegExp(`Value ${entry} is not valid as a pixel format.`),
			)),
	);
});
