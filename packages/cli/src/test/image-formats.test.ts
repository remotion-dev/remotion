import {afterEach, expect, test} from 'bun:test';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {parsedCli} from '../parsed-cli';

const {pixelFormatOption, proResProfileOption, videoImageFormatOption} =
	BrowserSafeApis.options;

afterEach(() => {
	Reflect.deleteProperty(parsedCli, 'image-format');
	Reflect.deleteProperty(parsedCli, 'pixel-format');
	Reflect.deleteProperty(parsedCli, 'prores-profile');
	videoImageFormatOption.setConfig(null);
	pixelFormatOption.setConfig('yuv420p');
	proResProfileOption.setConfig(undefined);
});

test('returns jpeg for av1 codec', () => {
	expect(
		videoImageFormatOption.getValue(
			{commandLine: parsedCli},
			{
				codec: 'av1',
				uiVideoImageFormat: null,
				compositionDefaultVideoImageFormat: null,
			},
		).value,
	).toBe('jpeg');
});

test('returns png if codec is undefined', () => {
	expect(
		videoImageFormatOption.getValue(
			{commandLine: parsedCli},
			{
				codec: undefined,
				uiVideoImageFormat: null,
				compositionDefaultVideoImageFormat: null,
			},
		).value,
	).toBe('png');
});

test('uses composition video image format before config', () => {
	videoImageFormatOption.setConfig('jpeg');
	expect(
		videoImageFormatOption.getValue(
			{commandLine: parsedCli},
			{
				codec: 'prores',
				uiVideoImageFormat: null,
				compositionDefaultVideoImageFormat: 'png',
			},
		).value,
	).toBe('png');
});

test('uses explicit video image format before composition default', () => {
	parsedCli['image-format'] = 'jpeg';
	expect(
		videoImageFormatOption.getValue(
			{commandLine: parsedCli},
			{
				codec: 'prores',
				uiVideoImageFormat: null,
				compositionDefaultVideoImageFormat: 'png',
			},
		).value,
	).toBe('jpeg');
});

test('uses composition pixel format before config', () => {
	pixelFormatOption.setConfig('yuv444p');
	expect(
		pixelFormatOption.getValue(
			{commandLine: parsedCli},
			{
				uiPixelFormat: null,
				compositionDefaultPixelFormat: 'yuva444p10le',
			},
		).value,
	).toBe('yuva444p10le');
});

test('uses CLI pixel format before composition default', () => {
	parsedCli['pixel-format'] = 'yuv422p';
	expect(
		pixelFormatOption.getValue(
			{commandLine: parsedCli},
			{
				uiPixelFormat: null,
				compositionDefaultPixelFormat: 'yuva444p10le',
			},
		).value,
	).toBe('yuv422p');
});

test('uses composition ProRes profile before config', () => {
	proResProfileOption.setConfig('hq');
	expect(
		proResProfileOption.getValue(
			{commandLine: parsedCli},
			{
				uiProResProfile: undefined,
				compositionDefaultProResProfile: '4444',
			},
		).value,
	).toBe('4444');
});

test('uses CLI ProRes profile before composition default', () => {
	parsedCli['prores-profile'] = 'light';
	expect(
		proResProfileOption.getValue(
			{commandLine: parsedCli},
			{
				uiProResProfile: undefined,
				compositionDefaultProResProfile: '4444',
			},
		).value,
	).toBe('light');
});
