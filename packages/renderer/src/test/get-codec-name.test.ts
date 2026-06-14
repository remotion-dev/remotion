import {afterAll, afterEach, describe, expect, mock, test} from 'bun:test';
import type {Codec} from '../codec';
import type {HardwareAccelerationOption} from '../options/hardware-acceleration';

// Mock remotion/version before importing the module under test
mock.module('remotion/version', () => ({
	VERSION: '4.0.0-test',
}));

const {getCodecName} = require('../get-codec-name');

const originalPlatform = process.platform;

const setPlatform = (platform: string) => {
	Object.defineProperty(process, 'platform', {value: platform});
};

const restorePlatform = () => {
	Object.defineProperty(process, 'platform', {value: originalPlatform});
};

const callGetCodecName = ({
	codec,
	hardwareAcceleration,
	crf,
	encodingMaxRate = null,
	encodingBufferSize = null,
}: {
	codec: Codec;
	hardwareAcceleration: HardwareAccelerationOption;
	crf?: number;
	encodingMaxRate?: string | null;
	encodingBufferSize?: string | null;
}) =>
	getCodecName({
		codec,
		hardwareAcceleration,
		crf: crf ?? null,
		encodingMaxRate,
		encodingBufferSize,
		logLevel: 'warn',
		indent: false,
	});

describe('getCodecName - macOS VideoToolbox (existing behavior)', () => {
	afterEach(restorePlatform);

	test('h264 + darwin + hwaccel:required + no CRF', () => {
		setPlatform('darwin');
		expect(
			callGetCodecName({codec: 'h264', hardwareAcceleration: 'required'}),
		).toEqual({encoderName: 'h264_videotoolbox', hardwareAccelerated: true});
	});

	test('h265 + darwin + hwaccel:required + no CRF', () => {
		setPlatform('darwin');
		expect(
			callGetCodecName({codec: 'h265', hardwareAcceleration: 'required'}),
		).toEqual({encoderName: 'hevc_videotoolbox', hardwareAccelerated: true});
	});

	test('prores + darwin + hwaccel:required + no CRF', () => {
		setPlatform('darwin');
		expect(
			callGetCodecName({codec: 'prores', hardwareAcceleration: 'required'}),
		).toEqual({
			encoderName: 'prores_videotoolbox',
			hardwareAccelerated: true,
		});
	});

	test('h264 + darwin + hwaccel:required + crf=20 throws error', () => {
		setPlatform('darwin');
		expect(() =>
			callGetCodecName({
				codec: 'h264',
				hardwareAcceleration: 'required',
				crf: 20,
			}),
		).toThrow(/hardware accelerated encoding/);
	});

	test('h264 + darwin + hwaccel:disable returns software encoder', () => {
		setPlatform('darwin');
		expect(
			callGetCodecName({codec: 'h264', hardwareAcceleration: 'disable'}),
		).toEqual({encoderName: 'libx264', hardwareAccelerated: false});
	});
});

describe('getCodecName - NVENC on Linux', () => {
	afterEach(restorePlatform);

	test('h264 + linux + hwaccel:if-possible + no CRF', () => {
		setPlatform('linux');
		expect(
			callGetCodecName({codec: 'h264', hardwareAcceleration: 'if-possible'}),
		).toEqual({encoderName: 'h264_nvenc', hardwareAccelerated: true});
	});

	test('h265 + linux + hwaccel:if-possible + no CRF', () => {
		setPlatform('linux');
		expect(
			callGetCodecName({codec: 'h265', hardwareAcceleration: 'if-possible'}),
		).toEqual({encoderName: 'hevc_nvenc', hardwareAccelerated: true});
	});

	test('h264 + linux + hwaccel:required + no CRF', () => {
		setPlatform('linux');
		expect(
			callGetCodecName({codec: 'h264', hardwareAcceleration: 'required'}),
		).toEqual({encoderName: 'h264_nvenc', hardwareAccelerated: true});
	});

	test('h264 + linux + hwaccel:if-possible + crf=20 falls back to software', () => {
		setPlatform('linux');
		expect(
			callGetCodecName({
				codec: 'h264',
				hardwareAcceleration: 'if-possible',
				crf: 20,
			}),
		).toEqual({encoderName: 'libx264', hardwareAccelerated: false});
	});
});

describe('getCodecName - NVENC on Windows', () => {
	afterEach(restorePlatform);

	test('h264 + win32 + hwaccel:if-possible + no CRF', () => {
		setPlatform('win32');
		expect(
			callGetCodecName({codec: 'h264', hardwareAcceleration: 'if-possible'}),
		).toEqual({encoderName: 'h264_nvenc', hardwareAccelerated: true});
	});

	test('h265 + win32 + hwaccel:if-possible + no CRF', () => {
		setPlatform('win32');
		expect(
			callGetCodecName({codec: 'h265', hardwareAcceleration: 'if-possible'}),
		).toEqual({encoderName: 'hevc_nvenc', hardwareAccelerated: true});
	});

	test('h264 + win32 + hwaccel:required + no CRF', () => {
		setPlatform('win32');
		expect(
			callGetCodecName({codec: 'h264', hardwareAcceleration: 'required'}),
		).toEqual({encoderName: 'h264_nvenc', hardwareAccelerated: true});
	});

	test('h265 + win32 + hwaccel:required + no CRF', () => {
		setPlatform('win32');
		expect(
			callGetCodecName({codec: 'h265', hardwareAcceleration: 'required'}),
		).toEqual({encoderName: 'hevc_nvenc', hardwareAccelerated: true});
	});

	test('h264 + win32 + hwaccel:if-possible + crf=20 falls back to software', () => {
		setPlatform('win32');
		expect(
			callGetCodecName({
				codec: 'h264',
				hardwareAcceleration: 'if-possible',
				crf: 20,
			}),
		).toEqual({encoderName: 'libx264', hardwareAccelerated: false});
	});

	test('h265 + win32 + hwaccel:if-possible + crf=20 falls back to software', () => {
		setPlatform('win32');
		expect(
			callGetCodecName({
				codec: 'h265',
				hardwareAcceleration: 'if-possible',
				crf: 20,
			}),
		).toEqual({encoderName: 'libx265', hardwareAccelerated: false});
	});
});

describe('getCodecName - No hardware acceleration for unsupported codecs', () => {
	afterEach(restorePlatform);

	test('vp8 + linux + hwaccel:required returns software', () => {
		setPlatform('linux');
		expect(
			callGetCodecName({codec: 'vp8', hardwareAcceleration: 'required'}),
		).toEqual({encoderName: 'libvpx', hardwareAccelerated: false});
	});

	test('vp9 + linux + hwaccel:required returns software', () => {
		setPlatform('linux');
		expect(
			callGetCodecName({codec: 'vp9', hardwareAcceleration: 'required'}),
		).toEqual({encoderName: 'libvpx-vp9', hardwareAccelerated: false});
	});

	test('av1 + linux + hwaccel:required returns software', () => {
		setPlatform('linux');
		expect(
			callGetCodecName({codec: 'av1', hardwareAcceleration: 'required'}),
		).toEqual({encoderName: 'libaom-av1', hardwareAccelerated: false});
	});

	test('prores + linux + hwaccel:required throws error (no NVENC ProRes)', () => {
		setPlatform('linux');
		expect(() =>
			callGetCodecName({codec: 'prores', hardwareAcceleration: 'required'}),
		).toThrow(/does not support hardware acceleration/);
	});

	test('h264-mkv + linux + hwaccel:required throws error', () => {
		setPlatform('linux');
		expect(() =>
			callGetCodecName({codec: 'h264-mkv', hardwareAcceleration: 'required'}),
		).toThrow(/does not support hardware acceleration/);
	});

	test('h264-ts + linux + hwaccel:required throws error', () => {
		setPlatform('linux');
		expect(() =>
			callGetCodecName({codec: 'h264-ts', hardwareAcceleration: 'required'}),
		).toThrow(/does not support hardware acceleration/);
	});
});

describe('getCodecName - software fallback', () => {
	afterEach(restorePlatform);

	test('h264 + linux + hwaccel:disable returns software', () => {
		setPlatform('linux');
		expect(
			callGetCodecName({codec: 'h264', hardwareAcceleration: 'disable'}),
		).toEqual({encoderName: 'libx264', hardwareAccelerated: false});
	});

	test('h265 + win32 + hwaccel:disable returns software', () => {
		setPlatform('win32');
		expect(
			callGetCodecName({codec: 'h265', hardwareAcceleration: 'disable'}),
		).toEqual({encoderName: 'libx265', hardwareAccelerated: false});
	});
});

describe('getCodecName - audio codecs return null', () => {
	test('mp3 returns null', () => {
		expect(
			callGetCodecName({codec: 'mp3', hardwareAcceleration: 'disable'}),
		).toBeNull();
	});

	test('aac returns null', () => {
		expect(
			callGetCodecName({codec: 'aac', hardwareAcceleration: 'disable'}),
		).toBeNull();
	});

	test('wav returns null', () => {
		expect(
			callGetCodecName({codec: 'wav', hardwareAcceleration: 'disable'}),
		).toBeNull();
	});
});

afterAll(restorePlatform);
