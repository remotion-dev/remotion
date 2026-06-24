import {describe, expect, test} from 'bun:test';
import type {PixelFormat} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
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

describe('pixel-format source tracking for composition default override', () => {
	test('returns source: default when no CLI flag and no config set', () => {
		// Reset to default
		pixelFormatOption.setConfig('yuv420p');
		const result = pixelFormatOption.getValue({commandLine: {}});
		expect(result.source).toBe('default');
	});

	test('returns source: config when config is explicitly set to non-default', () => {
		pixelFormatOption.setConfig('yuva420p');
		const result = pixelFormatOption.getValue({commandLine: {}});
		expect(result.source).toBe('config');
		expect(result.value).toBe('yuva420p');
	});

	test('returns source: cli when CLI flag is passed', () => {
		const result = pixelFormatOption.getValue({
			commandLine: {'pixel-format': 'yuv444p'},
		});
		expect(result.source).toBe('cli');
		expect(result.value).toBe('yuv444p');
	});
});

describe('pixel-format source tracking for composition default override', () => {
	test('returns source: default when no CLI flag and no config set', () => {
		// Reset to default
		pixelFormatOption.setConfig('yuv420p');
		const result = pixelFormatOption.getValue({commandLine: {}});
		expect(result.source).toBe('default');
	});

	test('returns source: config when config is explicitly set to non-default', () => {
		pixelFormatOption.setConfig('yuva420p');
		const result = pixelFormatOption.getValue({commandLine: {}});
		expect(result.source).toBe('config');
		expect(result.value).toBe('yuva420p');
	});

	test('returns source: cli when CLI flag is passed', () => {
		const result = pixelFormatOption.getValue({
			commandLine: {'pixel-format': 'yuv444p'},
		});
		expect(result.source).toBe('cli');
		expect(result.value).toBe('yuv444p');
	});

	test('cli flag beats config value', () => {
		pixelFormatOption.setConfig('yuva420p');
		const result = pixelFormatOption.getValue({
			commandLine: {'pixel-format': 'yuv444p'},
		});
		expect(result.source).toBe('cli');
		expect(result.value).toBe('yuv444p');
	});
});
