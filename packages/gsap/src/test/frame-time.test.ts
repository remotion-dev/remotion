import {describe, expect, it} from 'bun:test';
import {frameToSeconds} from '../frame-time';

describe('frameToSeconds', () => {
	it('converts frames into absolute timeline seconds', () => {
		expect(frameToSeconds(45, 30)).toBe(1.5);
		expect(frameToSeconds(24, 24)).toBe(1);
		expect(frameToSeconds(120, 60)).toBe(2);
	});

	it('clamps premount frames by default', () => {
		expect(frameToSeconds(-12, 30)).toBe(0);
	});

	it('rejects invalid frame and fps values', () => {
		expect(() => frameToSeconds(Number.NaN, 30)).toThrow(TypeError);
		expect(() => frameToSeconds(10, 0)).toThrow(RangeError);
		expect(() => frameToSeconds(10, Number.POSITIVE_INFINITY)).toThrow(
			RangeError,
		);
	});
});
