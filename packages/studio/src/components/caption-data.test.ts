import {expect, test} from 'bun:test';
import {isCaptionDataArray} from './caption-data';

test('recognizes caption data', () => {
	expect(
		isCaptionDataArray([
			{
				text: ' Hello',
				startMs: 0,
				endMs: 420,
				timestampMs: null,
				confidence: 0.98,
			},
		]),
	).toBe(true);
});

test('accepts an empty caption array', () => {
	expect(isCaptionDataArray([])).toBe(true);
});

test('rejects caption data that does not match the caption format', () => {
	expect(isCaptionDataArray({text: 'Hello'})).toBe(false);
	expect(
		isCaptionDataArray([
			{
				text: 'Hello',
				startMs: 0,
				endMs: '420',
				timestampMs: null,
				confidence: null,
			},
		]),
	).toBe(false);
	expect(
		isCaptionDataArray([
			{
				text: 'Hello',
				startMs: 0,
				endMs: 420,
				timestampMs: null,
			},
		]),
	).toBe(false);
});
