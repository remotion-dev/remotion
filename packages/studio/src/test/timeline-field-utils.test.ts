import {expect, test} from 'bun:test';
import {formatTimelineFieldValueForDisplay} from '../components/Timeline/timeline-field-display-utils';
import {
	formatTimelineNumber,
	getDecimalPlaces,
	getTimelineDisplayDecimalPlaces,
} from '../components/Timeline/timeline-field-utils';
import {formatTimelineRotationFieldValue} from '../components/Timeline/timeline-rotation-field-utils';

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

test('formatTimelineFieldValueForDisplay formats number fields based on step', () => {
	expect(
		formatTimelineFieldValueForDisplay({
			fieldSchema: {
				type: 'number',
				default: 0,
				hiddenFromList: false,
				step: 0.01,
			},
			value: 1.2000000000000002,
		}),
	).toBe('1.20');
});

test('formatTimelineFieldValueForDisplay formats scale fields with fixed decimals', () => {
	expect(
		formatTimelineFieldValueForDisplay({
			fieldSchema: {
				type: 'scale',
				default: 1,
				step: 0.01,
			},
			value: 2.044585,
		}),
	).toBe('2.045');
});

test('formatTimelineFieldValueForDisplay formats rotation fields as degrees', () => {
	expect(
		formatTimelineFieldValueForDisplay({
			fieldSchema: {
				type: 'rotation-css',
				default: '0deg',
				step: 1,
			},
			value: '0.7853981633974483rad',
		}),
	).toBe('45°');
});

test('formatTimelineRotationFieldValue formats numeric CSS rotations as degrees', () => {
	expect(
		formatTimelineRotationFieldValue({
			decimalPlaces: 1,
			fieldSchema: {
				type: 'rotation-css',
				default: '0deg',
				step: 1,
			},
			value: 12,
		}),
	).toBe('12°');
});

test('formatTimelineFieldValueForDisplay formats translate fields as pixels', () => {
	expect(
		formatTimelineFieldValueForDisplay({
			fieldSchema: {
				type: 'translate',
				default: '0px 0px',
				step: 1,
			},
			value: '12.345px 0px',
		}),
	).toBe('12.3px 0px');
});

test('formatTimelineFieldValueForDisplay preserves transform-origin units', () => {
	expect(
		formatTimelineFieldValueForDisplay({
			fieldSchema: {
				type: 'transform-origin',
				default: '50% 50%',
				step: 0.01,
			},
			value: '10.1234px 20.5678%',
		}),
	).toBe('10.12px 20.57%');
});

test('formatTimelineFieldValueForDisplay formats UV coordinate tuples', () => {
	expect(
		formatTimelineFieldValueForDisplay({
			fieldSchema: {
				type: 'uv-coordinate',
				default: [0.5, 0.5],
				step: 0.01,
			},
			value: [0.123456, 0.5],
		}),
	).toBe('0.12, 0.50');
});

test('formatTimelineFieldValueForDisplay rounds unknown numeric fallbacks', () => {
	expect(
		formatTimelineFieldValueForDisplay({
			fieldSchema: undefined,
			value: 10.000000000000002,
		}),
	).toBe('10');
});

test('formatTimelineFieldValueForDisplay shows undefined schema values as unset', () => {
	expect(
		formatTimelineFieldValueForDisplay({
			fieldSchema: {
				type: 'number',
				default: undefined,
				hiddenFromList: false,
			},
			value: undefined,
		}),
	).toBe('unset');

	expect(
		formatTimelineFieldValueForDisplay({
			fieldSchema: undefined,
			value: undefined,
		}),
	).toBe('undefined');
});
