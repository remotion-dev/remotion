import {expect, test} from 'bun:test';
import {generateFfmpegArgs} from '../ffmpeg-args';

test('Should add premultiply filter for ProRes with yuva444p10le', () => {
	const args = generateFfmpegArgs({
		hasPreencoded: false,
		proResProfileName: '4444',
		pixelFormat: 'yuva444p10le',
		x264Preset: null,
		codec: 'prores',
		crf: null,
		videoBitrate: null,
		encodingMaxRate: null,
		encodingBufferSize: null,
		colorSpace: null,
		hardwareAcceleration: 'if-possible',
		indent: false,
		logLevel: 'info',
	});

	const flatArgs = args.flat();
	const vfIndex = flatArgs.indexOf('-vf');
	expect(vfIndex).toBeGreaterThan(-1);

	const vfValue = flatArgs[vfIndex + 1];
	expect(vfValue).toContain('premultiply=inplace=1');
});

test('Should add premultiply filter for ProRes with yuva420p', () => {
	const args = generateFfmpegArgs({
		hasPreencoded: false,
		proResProfileName: '4444',
		pixelFormat: 'yuva420p',
		x264Preset: null,
		codec: 'prores',
		crf: null,
		videoBitrate: null,
		encodingMaxRate: null,
		encodingBufferSize: null,
		colorSpace: null,
		hardwareAcceleration: 'if-possible',
		indent: false,
		logLevel: 'info',
	});

	const flatArgs = args.flat();
	const vfIndex = flatArgs.indexOf('-vf');
	expect(vfIndex).toBeGreaterThan(-1);

	const vfValue = flatArgs[vfIndex + 1];
	expect(vfValue).toContain('premultiply=inplace=1');
});

test('Should NOT add premultiply filter for ProRes without alpha', () => {
	const args = generateFfmpegArgs({
		hasPreencoded: false,
		proResProfileName: '4444',
		pixelFormat: 'yuv444p10le',
		x264Preset: null,
		codec: 'prores',
		crf: null,
		videoBitrate: null,
		encodingMaxRate: null,
		encodingBufferSize: null,
		colorSpace: null,
		hardwareAcceleration: 'if-possible',
		indent: false,
		logLevel: 'info',
	});

	const flatArgs = args.flat();
	const vfIndex = flatArgs.indexOf('-vf');

	if (vfIndex > -1) {
		const vfValue = flatArgs[vfIndex + 1];
		expect(vfValue).not.toContain('premultiply');
	}
});

test('Should NOT add premultiply filter for h264 with alpha pixel format', () => {
	const args = generateFfmpegArgs({
		hasPreencoded: false,
		proResProfileName: null,
		pixelFormat: 'yuva420p',
		x264Preset: null,
		codec: 'h264',
		crf: 18,
		videoBitrate: null,
		encodingMaxRate: null,
		encodingBufferSize: null,
		colorSpace: null,
		hardwareAcceleration: 'if-possible',
		indent: false,
		logLevel: 'info',
	});

	const flatArgs = args.flat();
	const vfIndex = flatArgs.indexOf('-vf');

	if (vfIndex > -1) {
		const vfValue = flatArgs[vfIndex + 1];
		expect(vfValue).not.toContain('premultiply');
	}
});

test('Should chain premultiply with colorspace filter for bt709', () => {
	const args = generateFfmpegArgs({
		hasPreencoded: false,
		proResProfileName: '4444',
		pixelFormat: 'yuva444p10le',
		x264Preset: null,
		codec: 'prores',
		crf: null,
		videoBitrate: null,
		encodingMaxRate: null,
		encodingBufferSize: null,
		colorSpace: 'bt709',
		hardwareAcceleration: 'if-possible',
		indent: false,
		logLevel: 'info',
	});

	const flatArgs = args.flat();
	const vfIndex = flatArgs.indexOf('-vf');
	expect(vfIndex).toBeGreaterThan(-1);

	const vfValue = flatArgs[vfIndex + 1];
	// Should have both filters chained with comma
	expect(vfValue).toContain('premultiply=inplace=1');
	expect(vfValue).toContain('zscale=matrix=709');
	expect(vfValue).toContain(',');

	// Premultiply should come before zscale
	const premultiplyIndex = vfValue.indexOf('premultiply');
	const zscaleIndex = vfValue.indexOf('zscale');
	expect(premultiplyIndex).toBeLessThan(zscaleIndex);
});

test('Should NOT add premultiply filter when hasPreencoded is true', () => {
	const args = generateFfmpegArgs({
		hasPreencoded: true,
		proResProfileName: '4444',
		pixelFormat: 'yuva444p10le',
		x264Preset: null,
		codec: 'prores',
		crf: null,
		videoBitrate: null,
		encodingMaxRate: null,
		encodingBufferSize: null,
		colorSpace: null,
		hardwareAcceleration: 'if-possible',
		indent: false,
		logLevel: 'info',
	});

	const flatArgs = args.flat();
	expect(flatArgs).not.toContain('premultiply=inplace=1');
});
