import {afterEach, describe, expect, mock, test} from 'bun:test';

// Mock remotion/version before importing
mock.module('remotion/version', () => ({
	VERSION: '4.0.0-test',
}));

const {resolveHardwareAcceleration} = require('../probe-encoder');

/**
 * Tests for resolveHardwareAcceleration that DO NOT trigger actual FFmpeg probing.
 * These test the logic branches that short-circuit before any execFileSync call:
 * - "disable" passthrough
 * - Audio codec passthrough (getCodecName returns null)
 * - Software encoder passthrough (getCodecName returns non-hw-accelerated)
 *
 * Probing-dependent paths (if-possible/required with hardware encoders) are
 * exercised by integration tests that run with the real FFmpeg binary.
 */
describe('resolveHardwareAcceleration', () => {
	const originalPlatform = process.platform;
	const setPlatform = (platform: string) => {
		Object.defineProperty(process, 'platform', {value: platform});
	};

	const restorePlatform = () => {
		Object.defineProperty(process, 'platform', {value: originalPlatform});
	};

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

	test('returns original value for aac codec', () => {
		expect(
			resolveHardwareAcceleration({
				codec: 'aac',
				hardwareAcceleration: 'required',
				binariesDirectory: null,
				indent: false,
				logLevel: 'warn',
				crf: null,
				encodingMaxRate: null,
				encodingBufferSize: null,
			}),
		).toBe('required');
	});

	test('returns original value for wav codec', () => {
		expect(
			resolveHardwareAcceleration({
				codec: 'wav',
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

	describe('software encoder passthrough', () => {
		afterEach(restorePlatform);

		test('returns original value when getCodecName returns software (CRF set on linux)', () => {
			setPlatform('linux');
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

		test('returns original value when codec has no hw encoder (vp8)', () => {
			setPlatform('linux');
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

		test('returns original value when codec has no hw encoder (av1)', () => {
			setPlatform('linux');
			expect(
				resolveHardwareAcceleration({
					codec: 'av1',
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

		test('returns "disable" when hardwareAcceleration is "disable" even with NVENC-capable codec', () => {
			setPlatform('linux');
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
	});
});
