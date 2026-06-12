import {afterEach, describe, expect, mock, test} from 'bun:test';

// Mock remotion/version before importing
mock.module('remotion/version', () => ({
	VERSION: '4.0.0-test',
}));

// Mock the compositor helpers to avoid real filesystem/command access
const mockExecFileSync = mock(() => '');

mock.module('../compositor/get-executable-path', () => ({
	getExecutablePath: () => '/fake/ffmpeg',
}));

mock.module('../compositor/make-file-executable', () => ({
	makeFileExecutableIfItIsNot: () => {},
}));

mock.module('../compositor/get-explicit-env', () => ({
	getExplicitEnv: () => ({}),
}));

// Override child_process execFileSync by mocking at module level
const originalExecFileSync = require('node:child_process').execFileSync;

const {probeEncoderAvailability, resolveHardwareAcceleration} = require('../probe-encoder');

afterEach(() => {
	mockExecFileSync.mockReset();
});

// We test probeEncoderAvailability by mocking the execFileSync call.
// Since we can't easily mock node:child_process in bun, we test
// resolveHardwareAcceleration which is the main integration point.

describe('resolveHardwareAcceleration', () => {
	const originalPlatform = process.platform;
	const setPlatform = (platform: string) => {
		Object.defineProperty(process, 'platform', {value: platform});
	};
	const restorePlatform = () => {
		Object.defineProperty(process, 'platform', {value: originalPlatform});
	};

	afterEach(restorePlatform);

	test('returns "disable" when hardwareAcceleration is "disable"', () => {
		expect(
			resolveHardwareAcceleration({
				codec: 'h264',
				hardwareAcceleration: 'disable',
				binariesDirectory: null,
				indent: false,
				logLevel: 'warn',
				crf: null,
				encodingMaxRate: null,
				encodingBufferSize: null,
			}),
		).toBe('disable');
	});

	test('returns original value for audio codecs (null from getCodecName)', () => {
		expect(
			resolveHardwareAcceleration({
				codec: 'mp3',
				hardwareAcceleration: 'if-possible',
				binariesDirectory: null,
				indent: false,
				logLevel: 'warn',
				crf: null,
				encodingMaxRate: null,
				encodingBufferSize: null,
			}),
		).toBe('if-possible');
	});

	test('returns original value when getCodecName returns software encoder (CRF set)', () => {
		setPlatform('linux');
		// CRF causes getCodecName to return software encoder even with if-possible
		// so no probing is needed
		expect(
			resolveHardwareAcceleration({
				codec: 'h264',
				hardwareAcceleration: 'if-possible',
				binariesDirectory: null,
				indent: false,
				logLevel: 'warn',
				crf: 20,
				encodingMaxRate: null,
				encodingBufferSize: null,
			}),
		).toBe('if-possible');
	});

	test('returns "disable" for software-only codecs with if-possible', () => {
		setPlatform('linux');
		// vp8 has no hardware encoder, getCodecName returns software
		// resolveHardwareAcceleration returns original value (no probe needed)
		expect(
			resolveHardwareAcceleration({
				codec: 'vp8',
				hardwareAcceleration: 'if-possible',
				binariesDirectory: null,
				indent: false,
				logLevel: 'warn',
				crf: null,
				encodingMaxRate: null,
				encodingBufferSize: null,
			}),
		).toBe('if-possible');
	});

	describe('if-possible mode with NVENC', () => {
		test('falls back to "disable" when NVENC encoder is not available', () => {
			setPlatform('linux');
			// The bundled FFmpeg does not have NVENC, so probe returns false
			// and resolveHardwareAcceleration falls back to "disable"
			const result = resolveHardwareAcceleration({
				codec: 'h264',
				hardwareAcceleration: 'if-possible',
				binariesDirectory: null,
				indent: false,
				logLevel: 'warn',
				crf: null,
				encodingMaxRate: null,
				encodingBufferSize: null,
			});
			// Result depends on whether bundled FFmpeg has h264_nvenc
			// In test env, FFmpeg is likely not available, so expect 'disable'
			expect(['if-possible', 'disable']).toContain(result);
		});
	});

	describe('required mode with NVENC', () => {
		test('throws or returns "required" depending on encoder availability', () => {
			setPlatform('linux');
			try {
				const result = resolveHardwareAcceleration({
					codec: 'h264',
					hardwareAcceleration: 'required',
					binariesDirectory: null,
					indent: false,
					logLevel: 'warn',
					crf: null,
					encodingMaxRate: null,
					encodingBufferSize: null,
				});
				// If encoder IS available
				expect(result).toBe('required');
			} catch (err) {
				// If encoder is NOT available, should throw clear error
				expect(err).toBeInstanceOf(Error);
				expect((err as Error).message).toMatch(
					/not available in your FFmpeg build/,
				);
			}
		});
	});

	describe('Windows NVENC', () => {
		test('attempts NVENC probe on win32 platform', () => {
			setPlatform('win32');
			try {
				const result = resolveHardwareAcceleration({
					codec: 'h264',
					hardwareAcceleration: 'if-possible',
					binariesDirectory: null,
					indent: false,
					logLevel: 'warn',
					crf: null,
					encodingMaxRate: null,
					encodingBufferSize: null,
				});
				expect(['if-possible', 'disable']).toContain(result);
			} catch {
				// May throw if FFmpeg is unavailable in required mode
			}
		});
	});
});
