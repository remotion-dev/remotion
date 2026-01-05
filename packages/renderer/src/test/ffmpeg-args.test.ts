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

	expect(args.flat().join(' ')).toBe(
		'-c:v prores_videotoolbox -vf premultiply=inplace=1 -profile:v 4444 -pix_fmt yuva420p -auto-alt-ref 0 -video_track_timescale 90000',
	);
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
	expect(flatArgs.join(' ')).toBe(
		'-c:v prores_videotoolbox -profile:v 4444 -pix_fmt yuv444p10le -video_track_timescale 90000',
	);
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
	expect(flatArgs.join(' ')).toBe(
		'-c:v libx264 -pix_fmt yuva420p -auto-alt-ref 0 -video_track_timescale 90000 -crf 18',
	);
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
	expect(flatArgs.join(' ')).toBe(
		'-c:v prores_videotoolbox -colorspace:v bt709 -color_primaries:v bt709 -color_trc:v bt709 -color_range tv -vf premultiply=inplace=1,zscale=matrix=709:matrixin=709:range=limited -profile:v 4444 -pix_fmt yuva444p10le -video_track_timescale 90000',
	);
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
	expect(flatArgs.join(' ')).toBe('-c:v copy');
});
