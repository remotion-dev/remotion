import {expect, test} from 'bun:test';
import type {Codec} from '../codec';
import {generateFfmpegArgs} from '../ffmpeg-args';
import {DEFAULT_COLOR_SPACE} from '../options/color-space';
import {validateGopSize} from '../options/gop-size';

test('validates GOP size', () => {
	expect(() => validateGopSize(null)).not.toThrow();
	expect(() => validateGopSize(239)).not.toThrow();
	expect(() => validateGopSize(0)).toThrow(/GOP size/);
	expect(() => validateGopSize(1.5)).toThrow(/GOP size/);
});

test('passes GOP size to FFmpeg', () => {
	const args = generateFfmpegArgs({
		hasPreencoded: false,
		proResProfileName: null,
		pixelFormat: 'yuv420p',
		x264Preset: null,
		gopSize: 239,
		codec: 'h264',
		crf: null,
		videoBitrate: null,
		encodingMaxRate: null,
		encodingBufferSize: null,
		colorSpace: DEFAULT_COLOR_SPACE,
		hardwareAcceleration: 'disable',
		indent: false,
		logLevel: 'info',
	});

	expect(args.flat()).toContain('-g');
	expect(args.flat()).toContain('239');
});

test('passes GOP size to all non-GIF video codecs', () => {
	const codecs: Codec[] = [
		'h264',
		'h264-mkv',
		'h264-ts',
		'h265',
		'vp8',
		'vp9',
		'av1',
		'prores',
	];

	for (const codec of codecs) {
		const args = generateFfmpegArgs({
			hasPreencoded: false,
			proResProfileName: codec === 'prores' ? 'hq' : null,
			pixelFormat: 'yuv420p',
			x264Preset: null,
			gopSize: 239,
			codec,
			crf: null,
			videoBitrate: null,
			encodingMaxRate: null,
			encodingBufferSize: null,
			colorSpace: DEFAULT_COLOR_SPACE,
			hardwareAcceleration: 'disable',
			indent: false,
			logLevel: 'info',
		});

		expect(args.flat()).toContain('-g');
		expect(args.flat()).toContain('239');
	}
});
