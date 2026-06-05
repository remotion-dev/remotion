import {expect, test} from 'bun:test';
import {
	formatTimelineNumber,
	getDecimalPlaces,
	getTimelineDisplayDecimalPlaces,
} from '../components/Timeline/timeline-field-utils';

test('getDecimalPlaces supports scientific notation', () => {
	expect(getDecimalPlaces(1e-7)).toBe(7);
	expect(getDecimalPlaces(1.25e-7)).toBe(9);
	expect(getDecimalPlaces(1.25e2)).toBe(0);
});

test('getTimelineDisplayDecimalPlaces uses the default cap if step is coarser', () => {
	expect(
		getTimelineDisplayDecimalPlaces({
			defaultDecimalPlaces: 2,
			step: 1,
		}),
	).toBe(2);
});

test('getTimelineDisplayDecimalPlaces respects more precise steps', () => {
	expect(
		getTimelineDisplayDecimalPlaces({
			defaultDecimalPlaces: 2,
			step: 0.001,
		}),
	).toBe(3);
});

test('formatTimelineNumber trims floating point noise', () => {
	expect(
		formatTimelineNumber({
			decimalPlaces: 2,
			fixed: true,
			value: 1.2000000000000002,
		}),
	).toBe('1.20');
});

test('formatTimelineNumber can omit unnecessary trailing zeroes', () => {
	expect(
		formatTimelineNumber({
			decimalPlaces: 1,
			fixed: false,
			value: 10.000000000000002,
		}),
	).toBe('10');
});
