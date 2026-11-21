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
const {getVaapiHevcRemuxArgs} = require('../vaapi-output');
const {
	VAAPI_DEVICE_ENV,
	getHevcCropBitstreamFilter,
	withVaapiUpload,
} = require('../vaapi');

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
}: {
	codec?: Codec;
	crf?: number | null;
	hasPreencoded?: boolean;
	colorSpace?: ColorSpace;
	x264Preset?: string | null;
	pixelFormat?: PixelFormat;
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
	});

describe('getCodecName - VA-API on Linux', () => {
	test('h264 and h265 pick the VA-API encoders when a render device is given', () => {
		expect(codecName('h264', 'if-possible')).toEqual({
			encoderName: 'h264_vaapi',
			hardwareAccelerated: true,
		});
		expect(codecName('h265', 'required')).toEqual({
			encoderName: 'hevc_vaapi',
			hardwareAccelerated: true,
		});
	});

	test('a CRF keeps VA-API on (it becomes the constant quantizer)', () => {
		expect(codecName('h264', 'if-possible', 18).encoderName).toBe('h264_vaapi');
		expect(codecName('h265', 'required', 18).encoderName).toBe('hevc_vaapi');
	});

	test('without a device, NVENC as before', () => {
		delete process.env[VAAPI_DEVICE_ENV];
		expect(codecName('h264', 'if-possible').encoderName).toBe('h264_nvenc');
		expect(codecName('h265', 'if-possible').encoderName).toBe('hevc_nvenc');
	});

	test('only what VA-API encodes exactly: 8-bit 4:2:0', () => {
		expect(
			codecName('h265', 'if-possible', null, 'yuv420p10le').encoderName,
		).toBe('hevc_nvenc');
		expect(codecName('h264', 'if-possible', null, 'yuv444p').encoderName).toBe(
			'h264_nvenc',
		);
		expect(codecName('h265', 'if-possible', null, 'yuv420p').encoderName).toBe(
			'hevc_vaapi',
		);
	});

	test('CRF 0 stays on the software encoder (FFmpeg treats -qp 0 as unset)', () => {
		expect(codecName('h265', 'if-possible', 0).encoderName).toBe('libx265');
		expect(() => codecName('h265', 'required', 0)).toThrow();
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
		const flat = ffmpegArgs({codec: 'h265', crf: 18}).flat();
		expect(flat).toContain('hevc_vaapi');
		const i = flat.indexOf('-rc_mode');
		expect(flat.slice(i, i + 4)).toEqual(['-rc_mode', 'CQP', '-qp', '18']);
		expect(flat).not.toContain('-crf');
	});

	test('a 10-bit request is not encoded by VA-API (no upload, its pixel format kept)', () => {
		const flat = ffmpegArgs({codec: 'h265', pixelFormat: 'yuv420p10le'}).flat();
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

	test('the finishing copy: the crop and the tag, each only when asked', () => {
		expect(
			getVaapiHevcRemuxArgs({
				input: 'in.mp4',
				output: 'out.mp4',
				crop: ['-bsf:v', 'hevc_metadata=crop_right=0:crop_bottom=8'],
				tagHvc1: true,
			}),
		).toEqual([
			'-hide_banner',
			'-v',
			'error',
			'-y',
			'-i',
			'in.mp4',
			'-map',
			'0',
			'-c',
			'copy',
			'-bsf:v',
			'hevc_metadata=crop_right=0:crop_bottom=8',
			'-tag:v',
			'hvc1',
			'out.mp4',
		]);
		const plain = getVaapiHevcRemuxArgs({
			input: 'in.mkv',
			output: 'out.mkv',
			crop: null,
			tagHvc1: false,
		});
		expect(plain).not.toContain('-bsf:v');
		expect(plain).not.toContain('-tag:v');
	});

	test('the HEVC crop only for a stream larger than the composition', () => {
		expect(
			getHevcCropBitstreamFilter({
				codedWidth: 1920,
				codedHeight: 1088,
				width: 1920,
				height: 1080,
			}),
		).toEqual(['-bsf:v', 'hevc_metadata=crop_right=0:crop_bottom=8']);
		expect(
			getHevcCropBitstreamFilter({
				codedWidth: 1920,
				codedHeight: 1080,
				width: 1920,
				height: 1080,
			}),
		).toBe(null);
		expect(
			getHevcCropBitstreamFilter({
				codedWidth: 1280,
				codedHeight: 720,
				width: 1920,
				height: 1080,
			}),
		).toBe(null);
	});
});
