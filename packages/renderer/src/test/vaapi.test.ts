import {afterEach, beforeEach, describe, expect, mock, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {Codec} from '../codec';
import type {ColorSpace} from '../options/color-space';
import type {HardwareAccelerationOption} from '../options/hardware-acceleration';
import type {PixelFormat} from '../pixel-format';

mock.module('remotion/version', () => ({
	VERSION: '4.0.0-test',
}));

const {getCodecName} = require('../get-codec-name');
const {generateFfmpegArgs} = require('../ffmpeg-args');
const {validateQualitySettings} = require('../crf');
const {probeVaapiEncoder} = require('../probe-encoder');
const {
	getHevcCropArgs,
	getVaapiRawStreamLocation,
	getVaapiRewrapArgs,
	getVaapiWrapArgs,
	parseHevcCodedSize,
} = require('../vaapi-output');
const {VAAPI_DEVICE_ENV, withVaapiUpload} = require('../vaapi');

const originalPlatform = process.platform;
const setPlatform = (platform: string) => {
	Object.defineProperty(process, 'platform', {value: platform});
};

// a stand-in for /dev/dri/renderD128: the device only has to exist
const device = path.join(
	fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-vaapi-')),
	'renderD128',
);
fs.writeFileSync(device, '');

beforeEach(() => {
	setPlatform('linux');
	process.env[VAAPI_DEVICE_ENV] = device;
});

afterEach(() => {
	Object.defineProperty(process, 'platform', {value: originalPlatform});
	delete process.env[VAAPI_DEVICE_ENV];
});

const codecName = (
	codec: Codec,
	hardwareAcceleration: HardwareAccelerationOption,
	crf: number | null = null,
	pixelFormat: PixelFormat | null = 'yuv420p',
) =>
	getCodecName({
		codec,
		hardwareAcceleration,
		crf,
		pixelFormat,
		vaapiRawStream: true,
		encodingMaxRate: null,
		encodingBufferSize: null,
		proResBitsPerMacroblock: null,
		logLevel: 'warn',
		indent: false,
		onLog: null,
	});

// where the stitcher encodes the video together with the audio
const stitcherCodecName = (
	codec: Codec,
	hardwareAcceleration: HardwareAccelerationOption,
	crf: number | null = null,
) =>
	getCodecName({
		codec,
		hardwareAcceleration,
		crf,
		pixelFormat: 'yuv420p',
		vaapiRawStream: false,
		encodingMaxRate: null,
		encodingBufferSize: null,
		proResBitsPerMacroblock: null,
		logLevel: 'warn',
		indent: false,
		onLog: null,
	});

const ffmpegArgs = ({
	codec = 'h264',
	crf = null,
	hasPreencoded = false,
	colorSpace = 'default',
	x264Preset = null,
	pixelFormat = 'yuv420p',
	vaapiRawStream = true,
}: {
	codec?: Codec;
	crf?: number | null;
	hasPreencoded?: boolean;
	colorSpace?: ColorSpace;
	x264Preset?: string | null;
	pixelFormat?: PixelFormat;
	vaapiRawStream?: boolean;
}): string[][] =>
	generateFfmpegArgs({
		hasPreencoded,
		proResProfileName: null,
		pixelFormat,
		x264Preset,
		gopSize: null,
		proResBitsPerMacroblock: null,
		codec,
		crf,
		videoBitrate: null,
		encodingMaxRate: null,
		encodingBufferSize: null,
		colorSpace,
		hardwareAcceleration: 'if-possible',
		indent: false,
		logLevel: 'info',
		cpuCount: 4,
		lambdaMemoryInBytes: null,
		vaapiRawStream,
	});

describe('getCodecName - VA-API on Linux', () => {
	test('h264 picks the VA-API encoder when a render device is given', () => {
		expect(codecName('h264', 'if-possible')).toEqual({
			encoderName: 'h264_vaapi',
			hardwareAccelerated: true,
		});
	});

	test('h265 picks the VA-API encoder where the encode writes a raw stream (the pre-encode)', () => {
		expect(codecName('h265', 'if-possible')).toEqual({
			encoderName: 'hevc_vaapi',
			hardwareAccelerated: true,
		});
		expect(codecName('h265', 'required', 18).encoderName).toBe('hevc_vaapi');
	});

	test('h265 keeps its other encoders where the video is encoded with the audio', () => {
		expect(stitcherCodecName('h265', 'if-possible').encoderName).toBe(
			'hevc_nvenc',
		);
		expect(stitcherCodecName('h265', 'if-possible', 18).encoderName).toBe(
			'libx265',
		);
		expect(() => stitcherCodecName('h265', 'required', 18)).toThrow();
		// H.264 is rewrapped there instead (vaapi-output.ts)
		expect(stitcherCodecName('h264', 'if-possible').encoderName).toBe(
			'h264_vaapi',
		);
	});

	test('a CRF keeps VA-API on (it becomes the constant quantizer)', () => {
		expect(codecName('h264', 'if-possible', 18).encoderName).toBe('h264_vaapi');
		expect(codecName('h264', 'required', 18).encoderName).toBe('h264_vaapi');
	});

	test('without a device, NVENC as before', () => {
		delete process.env[VAAPI_DEVICE_ENV];
		expect(codecName('h264', 'if-possible').encoderName).toBe('h264_nvenc');
		expect(codecName('h265', 'if-possible').encoderName).toBe('hevc_nvenc');
	});

	test('only what VA-API encodes exactly: 8-bit 4:2:0', () => {
		expect(
			codecName('h264', 'if-possible', null, 'yuv420p10le').encoderName,
		).toBe('h264_nvenc');
		expect(codecName('h264', 'if-possible', null, 'yuv444p').encoderName).toBe(
			'h264_nvenc',
		);
		expect(codecName('h264', 'if-possible', null, 'yuv420p').encoderName).toBe(
			'h264_vaapi',
		);
	});

	test('CRF 0 stays on the software encoder (FFmpeg treats -qp 0 as unset)', () => {
		expect(codecName('h264', 'if-possible', 0).encoderName).toBe('libx264');
		expect(() => codecName('h264', 'required', 0)).toThrow();
	});

	test('the probe starts a real encode on the device: none there, or no VA-API FFmpeg, is unavailable', () => {
		process.env[VAAPI_DEVICE_ENV] = path.join(path.dirname(device), 'nope');
		expect(
			probeVaapiEncoder({
				encoderName: 'hevc_vaapi',
				binariesDirectory: null,
				indent: false,
				logLevel: 'error',
			}),
		).toBe(false);
		// the stand-in is a plain file: nothing can encode on it
		process.env[VAAPI_DEVICE_ENV] = device;
		expect(
			probeVaapiEncoder({
				encoderName: 'h264_vaapi',
				binariesDirectory: null,
				indent: false,
				logLevel: 'error',
			}),
		).toBe(false);
	});

	test('hardware acceleration disabled: software encoding', () => {
		expect(codecName('h264', 'disable').encoderName).toBe('libx264');
	});

	test('only on Linux', () => {
		setPlatform('darwin');
		expect(codecName('h264', 'if-possible').encoderName).toBe(
			'h264_videotoolbox',
		);
	});

	test('codecs VA-API does not encode here keep their encoders', () => {
		expect(codecName('vp9', 'if-possible').encoderName).toBe('libvpx-vp9');
		expect(codecName('prores', 'if-possible').encoderName).toBe('prores_ks');
	});
});

describe('generateFfmpegArgs - VA-API', () => {
	test('the device, the encoder and the upload as the last filter', () => {
		const args = ffmpegArgs({});
		expect(args).toContainEqual(['-vaapi_device', device]);
		expect(args).toContainEqual(['-c:v', 'h264_vaapi']);
		expect(args).toContainEqual(['-vf', 'format=nv12,hwupload']);
	});

	test('no B-frames, so the wrap at the frame rate gives back every timestamp', () => {
		for (const codec of ['h264', 'h265'] as const) {
			const flat = ffmpegArgs({codec}).flat();
			const i = flat.indexOf('-bf');
			expect(flat.slice(i, i + 2)).toEqual(['-bf', '0']);
		}
	});

	test('h265 for a raw stream: the HEVC encoder on the device, the CRF its quantizer', () => {
		const flat = ffmpegArgs({codec: 'h265', crf: 18}).flat();
		expect(flat).toContain('-vaapi_device');
		expect(flat).toContain('hevc_vaapi');
		expect(flat).not.toContain('-pix_fmt');
		const i = flat.indexOf('-rc_mode');
		expect(flat.slice(i, i + 4)).toEqual(['-rc_mode', 'CQP', '-qp', '18']);
	});

	test('no -pix_fmt and no x264 preset for the VA-API encoder', () => {
		const flat = ffmpegArgs({x264Preset: 'faster'}).flat();
		expect(flat).not.toContain('-pix_fmt');
		expect(flat).not.toContain('-preset');
	});

	test('the upload follows the color space conversion in the same -vf', () => {
		const vf = ffmpegArgs({colorSpace: 'bt709'}).find((a) => a[0] === '-vf');
		expect(vf?.[1].startsWith('zscale=')).toBe(true);
		expect(vf?.[1].endsWith(',format=nv12,hwupload')).toBe(true);
	});

	test('a CRF is the constant quantizer', () => {
		const flat = ffmpegArgs({codec: 'h264', crf: 18}).flat();
		expect(flat).toContain('h264_vaapi');
		const i = flat.indexOf('-rc_mode');
		expect(flat.slice(i, i + 4)).toEqual(['-rc_mode', 'CQP', '-qp', '18']);
		expect(flat).not.toContain('-crf');
	});

	test('a 10-bit request is not encoded by VA-API (no upload, its pixel format kept)', () => {
		const flat = ffmpegArgs({codec: 'h264', pixelFormat: 'yuv420p10le'}).flat();
		expect(flat).not.toContain('-vaapi_device');
		expect(flat).toContain('yuv420p10le');
	});

	test('a copy of the pre-encoded stream needs no device', () => {
		const flat = ffmpegArgs({hasPreencoded: true}).flat();
		expect(flat).toContain('copy');
		expect(flat).not.toContain('-vaapi_device');
		expect(flat).not.toContain('format=nv12,hwupload');
	});
});

describe('validateQualitySettings - VA-API', () => {
	test('"required" with a CRF is allowed for VA-API', () => {
		expect(() =>
			validateQualitySettings({
				crf: 20,
				codec: 'h264',
				videoBitrate: null,
				encodingMaxRate: null,
				encodingBufferSize: null,
				hardwareAcceleration: 'required',
				hardwareAccelerated: false,
			}),
		).not.toThrow();
	});

	test('without a device it is refused as before', () => {
		delete process.env[VAAPI_DEVICE_ENV];
		expect(() =>
			validateQualitySettings({
				crf: 20,
				codec: 'h264',
				videoBitrate: null,
				encodingMaxRate: null,
				encodingBufferSize: null,
				hardwareAcceleration: 'required',
				hardwareAccelerated: false,
			}),
		).toThrow();
	});
});

describe('validateQualitySettings - H.265', () => {
	test('"required" with a CRF is allowed for H.265 (VA-API encodes it into a raw stream)', () => {
		expect(() =>
			validateQualitySettings({
				crf: 20,
				codec: 'h265',
				videoBitrate: null,
				encodingMaxRate: null,
				encodingBufferSize: null,
				hardwareAcceleration: 'required',
				hardwareAccelerated: false,
			}),
		).not.toThrow();
	});
});

describe('validateQualitySettings - CRF 0', () => {
	test('"required" with CRF 0 is refused even with a device', () => {
		expect(() =>
			validateQualitySettings({
				crf: 0,
				codec: 'h265',
				videoBitrate: null,
				encodingMaxRate: null,
				encodingBufferSize: null,
				hardwareAcceleration: 'required',
				hardwareAccelerated: false,
			}),
		).toThrow();
	});
});

describe('VA-API helpers', () => {
	test('withVaapiUpload appends to an existing -vf or adds one', () => {
		expect(withVaapiUpload([['-c:v', 'h264_vaapi']])).toEqual([
			['-c:v', 'h264_vaapi'],
			['-vf', 'format=nv12,hwupload'],
		]);
		expect(withVaapiUpload([['-vf', 'copy']])).toEqual([
			['-vf', 'copy,format=nv12,hwupload'],
		]);
	});

	test('the raw stream is written next to the file it becomes', () => {
		const dir = path.join(os.tmpdir(), 'render');
		expect(
			getVaapiRawStreamLocation(path.join(dir, 'pre-encode.mp4'), 'hevc'),
		).toBe(path.join(dir, 'pre-encode.vaapi.hevc'));
		expect(
			getVaapiRawStreamLocation(path.join(dir, 'pre-encode.mp4'), 'h264'),
		).toBe(path.join(dir, 'pre-encode.vaapi.h264'));
	});

	test('the coded size is read from the SPS (FFmpeg 8.1 trace_headers, Mesa 25.0 at 800x450)', () => {
		const trace = [
			'[trace_headers @ 0x6163c99ab3c0] 124         pic_width_in_luma_samples                 0000000001101000001 = 832',
			'[trace_headers @ 0x6163c99ab3c0] 143         pic_height_in_luma_samples                  00000000111010001 = 464',
			'[trace_headers @ 0x6163c99ab3c0] 164         conf_win_bottom_offset                                  00100 = 3',
		].join('\n');
		expect(parseHevcCodedSize(trace)).toEqual({width: 832, height: 464});
		expect(parseHevcCodedSize('[hevc @ 0x0] no SPS')).toBe(null);
	});

	test('the crop from the coded size back to the size asked, all four offsets written', () => {
		const at = (
			codedWidth: number,
			codedHeight: number,
			width: number,
			height: number,
		) =>
			getHevcCropArgs({
				input: 'a.hevc',
				output: 'b.hevc',
				codedWidth,
				codedHeight,
				width,
				height,
			});
		expect(at(1920, 1088, 1920, 1080)).toEqual([
			'-hide_banner',
			'-v',
			'error',
			'-y',
			'-f',
			'hevc',
			'-i',
			'a.hevc',
			'-c',
			'copy',
			'-bsf:v',
			'hevc_metadata=crop_left=0:crop_right=0:crop_top=0:crop_bottom=8',
			'-f',
			'hevc',
			'b.hevc',
		]);
		// the driver's own window here was 6 rows: it is replaced
		expect(at(832, 464, 800, 450)).toContain(
			'hevc_metadata=crop_left=0:crop_right=32:crop_top=0:crop_bottom=14',
		);
		// a coded size that already matches gets a window of zero
		expect(at(1920, 1080, 1920, 1080)).toContain(
			'hevc_metadata=crop_left=0:crop_right=0:crop_top=0:crop_bottom=0',
		);
		expect(() => at(1920, 1072, 1920, 1080)).toThrow();
	});

	test('the wrap: at the frame rate, HEVC tagged hvc1, the timescale for MP4 and MOV', () => {
		expect(
			getVaapiWrapArgs({
				input: 'a.hevc.crop',
				format: 'hevc',
				output: 'pre-encode.mp4',
				fps: 30,
			}),
		).toEqual([
			'-hide_banner',
			'-v',
			'error',
			'-y',
			'-r',
			'30',
			'-f',
			'hevc',
			'-i',
			'a.hevc.crop',
			'-c',
			'copy',
			'-tag:v',
			'hvc1',
			'-video_track_timescale',
			'90000',
			'pre-encode.mp4',
		]);
		const h264 = getVaapiWrapArgs({
			input: 'a.h264',
			format: 'h264',
			output: 'pre-encode.mp4',
			fps: 25,
		});
		expect(h264).not.toContain('-tag:v');
		expect(h264).toContain('-video_track_timescale');
		const mkv = getVaapiWrapArgs({
			input: 'a.h264',
			format: 'h264',
			output: 'pre-encode.mkv',
			fps: 25,
		});
		expect(mkv).not.toContain('-video_track_timescale');
	});

	test('the rewrap after an H.264 encode by the stitcher itself: Annex B from the stream, then wrapped again at the frame rate with the audio', () => {
		const {extract, wrap} = getVaapiRewrapArgs({
			input: 'out.mp4',
			annexB: 'out.vaapi.h264',
			output: 'out.vaapi.mp4',
			fps: 30,
		});
		expect(extract).toEqual([
			'-hide_banner',
			'-v',
			'error',
			'-y',
			'-i',
			'out.mp4',
			'-map',
			'0:v',
			'-c',
			'copy',
			'-bsf:v',
			'h264_mp4toannexb',
			'-f',
			'h264',
			'out.vaapi.h264',
		]);
		expect(wrap).toEqual([
			'-hide_banner',
			'-v',
			'error',
			'-y',
			'-r',
			'30',
			'-f',
			'h264',
			'-i',
			'out.vaapi.h264',
			'-i',
			'out.mp4',
			'-map',
			'0:v',
			'-map',
			'1:a?',
			'-c',
			'copy',
			'-video_track_timescale',
			'90000',
			'out.vaapi.mp4',
		]);
		const mkv = getVaapiRewrapArgs({
			input: 'out.mkv',
			annexB: 'out.vaapi.h264',
			output: 'out.vaapi.mkv',
			fps: 25,
		});
		expect(mkv.wrap).not.toContain('-video_track_timescale');
	});
});
