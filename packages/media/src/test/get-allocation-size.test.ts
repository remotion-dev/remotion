import {expect, test} from 'vitest';
import {getAllocationSize} from '../video-extraction/get-allocation-size';
import type {VideoSampleWithoutDuration} from '../video-extraction/keyframe-bank';

const makeSample = ({
	format,
	codedWidth,
	codedHeight,
	allocationSize,
}: {
	format: string | null;
	codedWidth: number;
	codedHeight: number;
	allocationSize?: number;
}) =>
	({
		format,
		codedWidth,
		codedHeight,
		allocationSize: () => allocationSize ?? 0,
	}) as unknown as VideoSampleWithoutDuration;

test('a readable sample reports its own allocation size', () => {
	const sample = makeSample({
		format: 'I420',
		codedWidth: 1920,
		codedHeight: 1080,
		allocationSize: 3110400,
	});

	expect(getAllocationSize(sample)).toBe(3110400);
});

test('an opaque 4K frame is estimated as 4:2:0, not RGBA', () => {
	const sample = makeSample({
		format: null,
		codedWidth: 3840,
		codedHeight: 2160,
	});

	// 24.9 MB, which is exactly P010 (10-bit 4:2:0), rather than the 33.2 MB
	// that 4 bytes per pixel would charge.
	expect(getAllocationSize(sample)).toBe(3840 * 2160 * 3);
	expect(getAllocationSize(sample)).toBeLessThan(3840 * 2160 * 4);
});

test('the estimate still bounds real 4:2:0 layouts from above', () => {
	const width = 3840;
	const height = 2160;
	const sample = makeSample({
		format: null,
		codedWidth: width,
		codedHeight: height,
	});

	const nv12EightBit = width * height * 1.5;
	const p010TenBit = width * height * 3;

	expect(getAllocationSize(sample)).toBeGreaterThanOrEqual(nv12EightBit);
	expect(getAllocationSize(sample)).toBeGreaterThanOrEqual(p010TenBit);
});
