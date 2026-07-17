import {expect, test} from 'bun:test';
import {
	fontWeightToNumericValue,
	resolveFontWeightSave,
} from '../components/Timeline/font-weight-utils';

test('fontWeightToNumericValue keeps finite numbers as-is', () => {
	expect(fontWeightToNumericValue(650)).toBe(650);
	expect(fontWeightToNumericValue(400)).toBe(400);
	expect(fontWeightToNumericValue(Number.NaN)).toBeNull();
});

test('fontWeightToNumericValue maps normal/bold to their CSS numbers', () => {
	expect(fontWeightToNumericValue('normal')).toBe(400);
	expect(fontWeightToNumericValue('bold')).toBe(700);
});

test('fontWeightToNumericValue parses numeric strings and rejects other text', () => {
	expect(fontWeightToNumericValue('650')).toBe(650);
	expect(fontWeightToNumericValue('lighter')).toBeNull();
	expect(fontWeightToNumericValue('')).toBeNull();
	expect(fontWeightToNumericValue(undefined)).toBeNull();
});

test('editing to an arbitrary weight saves it as an exact number (no snapping)', () => {
	expect(
		resolveFontWeightSave({stored: 400, newValue: 650, min: 1, max: 1000}),
	).toEqual({type: 'save', value: 650});
});

test('choosing a value equal to the stored number does not re-save', () => {
	expect(
		resolveFontWeightSave({stored: 650, newValue: 650, min: 1, max: 1000}),
	).toEqual({type: 'skip'});
});

test('normal/bold are not rewritten when the numeric field is left unchanged', () => {
	// 'normal' shows as 400 in the numeric field; committing 400 keeps 'normal'.
	expect(
		resolveFontWeightSave({stored: 'normal', newValue: 400, min: 1, max: 1000}),
	).toEqual({type: 'skip'});
	expect(
		resolveFontWeightSave({stored: 'bold', newValue: 700, min: 1, max: 1000}),
	).toEqual({type: 'skip'});
});

test('changing away from a string preset saves the new number', () => {
	expect(
		resolveFontWeightSave({stored: 'normal', newValue: 650, min: 1, max: 1000}),
	).toEqual({type: 'save', value: 650});
});

test('values outside 1..1000 are clamped to the field range', () => {
	expect(
		resolveFontWeightSave({stored: 400, newValue: 2000, min: 1, max: 1000}),
	).toEqual({type: 'save', value: 1000});
	expect(
		resolveFontWeightSave({stored: 400, newValue: -5, min: 1, max: 1000}),
	).toEqual({type: 'save', value: 1});
});
