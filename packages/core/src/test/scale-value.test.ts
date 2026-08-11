import {expect, test} from 'bun:test';
import {
	parseScaleValue,
	parseValidScaleValue,
	serializeScaleValue,
} from '../scale-value';

test('parses a numeric scale as uniform X and Y', () => {
	expect(parseScaleValue(2)).toEqual([2, 2, 1]);
});

test('parses two and three component scale strings', () => {
	expect(parseScaleValue('2 3')).toEqual([2, 3, 1]);
	expect(parseScaleValue('2 3 4')).toEqual([2, 3, 4]);
});

test('falls back for unsupported scale values', () => {
	expect(parseScaleValue('2px 3px')).toEqual([1, 1, 1]);
	expect(parseValidScaleValue('2px 3px')).toBe(null);
});

test('serializes uniform XY scale as a number', () => {
	expect(serializeScaleValue([2, 2, 1])).toBe(2);
});

test('serializes non-uniform scale as CSS scale syntax', () => {
	expect(serializeScaleValue([2, 3, 1])).toBe('2 3');
	expect(serializeScaleValue([2, 3, 4])).toBe('2 3 4');
});

test('serializes scale values without floating point noise', () => {
	expect(serializeScaleValue([0.1 + 0.2, 0.1 + 0.2, 1])).toBe(0.3);
});
