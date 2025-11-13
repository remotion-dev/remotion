import {describe, expect, test} from 'bun:test';
import {validateEvenDimensionsWithCodec} from '../validate-even-dimensions-with-codec';

describe('validateEvenDimensionsWithCodec', () => {
	const defaultConfig = {
		indent: false,
		logLevel: 'info' as const,
		wantsImageSequence: false,
	};

	describe('H264/H265 codec behavior with odd dimensions', () => {
		test('should round down odd width to even when using H264', () => {
			const result = validateEvenDimensionsWithCodec({
				width: 4000,
				height: 2592,
				scale: 0.35,
				codec: 'h264',
				...defaultConfig,
			});

			expect(result.actualWidth).toBe(4000); // 4000 * 0.35 = 1400 (even)
			expect(result.actualHeight).toBe(2590); // 2592 * 0.35 = 907.2 -> 907 (odd) -> 906 (even)
		});

		test('should round down odd width to even when using H265', () => {
			const result = validateEvenDimensionsWithCodec({
				width: 301,
				height: 200,
				scale: 1,
				codec: 'h265',
				...defaultConfig,
			});

			expect(result.actualWidth).toBe(300); // 301 (odd) -> 300 (even)
			expect(result.actualHeight).toBe(200); // 200 (already even)
		});

		test('should round down odd height to even when using H264', () => {
			const result = validateEvenDimensionsWithCodec({
				width: 200,
				height: 301,
				scale: 1,
				codec: 'h264',
				...defaultConfig,
			});

			expect(result.actualWidth).toBe(200); // 200 (already even)
			expect(result.actualHeight).toBe(300); // 301 (odd) -> 300 (even)
		});

		test('should round down both dimensions when both are odd', () => {
			const result = validateEvenDimensionsWithCodec({
				width: 301,
				height: 201,
				scale: 1,
				codec: 'h264',
				...defaultConfig,
			});

			expect(result.actualWidth).toBe(300); // 301 (odd) -> 300 (even)
			expect(result.actualHeight).toBe(200); // 201 (odd) -> 200 (even)
		});

		test('should work with H264-ts codec', () => {
			const result = validateEvenDimensionsWithCodec({
				width: 301,
				height: 200,
				scale: 1,
				codec: 'h264-ts',
				...defaultConfig,
			});

			expect(result.actualWidth).toBe(300); // 301 (odd) -> 300 (even)
			expect(result.actualHeight).toBe(200); // 200 (already even)
		});

		test('should work with H264-mkv codec', () => {
			const result = validateEvenDimensionsWithCodec({
				width: 301,
				height: 200,
				scale: 1,
				codec: 'h264-mkv',
				...defaultConfig,
			});

			expect(result.actualWidth).toBe(300); // 301 (odd) -> 300 (even)
			expect(result.actualHeight).toBe(200); // 200 (already even)
		});
	});

	describe('Even dimensions should remain unchanged', () => {
		test('should keep even dimensions as-is for H264', () => {
			const result = validateEvenDimensionsWithCodec({
				width: 1920,
				height: 1080,
				scale: 1,
				codec: 'h264',
				...defaultConfig,
			});

			expect(result.actualWidth).toBe(1920);
			expect(result.actualHeight).toBe(1080);
		});

		test('should keep even dimensions as-is for H265', () => {
			const result = validateEvenDimensionsWithCodec({
				width: 1000,
				height: 600,
				scale: 0.5,
				codec: 'h265',
				...defaultConfig,
			});

			expect(result.actualWidth).toBe(1000);
			expect(result.actualHeight).toBe(600);
		});
	});

	describe('Other codecs should not be affected', () => {
		test('should allow odd dimensions for VP8', () => {
			const result = validateEvenDimensionsWithCodec({
				width: 301,
				height: 201,
				scale: 1,
				codec: 'vp8',
				...defaultConfig,
			});

			expect(result.actualWidth).toBe(301);
			expect(result.actualHeight).toBe(201);
		});

		test('should allow odd dimensions for VP9', () => {
			const result = validateEvenDimensionsWithCodec({
				width: 301,
				height: 201,
				scale: 1,
				codec: 'vp9',
				...defaultConfig,
			});

			expect(result.actualWidth).toBe(301);
			expect(result.actualHeight).toBe(201);
		});

		test('should allow odd dimensions for ProRes', () => {
			const result = validateEvenDimensionsWithCodec({
				width: 301,
				height: 201,
				scale: 1,
				codec: 'prores',
				...defaultConfig,
			});

			expect(result.actualWidth).toBe(301);
			expect(result.actualHeight).toBe(201);
		});
	});

	describe('Image sequences should not be affected', () => {
		test('should allow odd dimensions for image sequences even with H264', () => {
			const result = validateEvenDimensionsWithCodec({
				width: 301,
				height: 201,
				scale: 1,
				codec: 'h264',
				wantsImageSequence: true,
				indent: false,
				logLevel: 'info' as const,
			});

			expect(result.actualWidth).toBe(301);
			expect(result.actualHeight).toBe(201);
		});
	});

	describe('Fractional dimensions rounding', () => {
		test('should handle fractional dimensions correctly', () => {
			const result = validateEvenDimensionsWithCodec({
				width: 1000,
				height: 1000,
				scale: 0.333,
				codec: 'h264',
				...defaultConfig,
			});

			// 1000 * 0.333 = 333, which is odd, should become 332
			// 998 * 0.3333 -> 332.334 will be rounded down
			expect(result.actualWidth).toBe(998);
			expect(result.actualHeight).toBe(998);
		});
	});
});
