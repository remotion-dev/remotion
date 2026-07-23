import {expect, test} from 'bun:test';
import {isCaptionJson, isCaptionJsonArray} from './caption-json';

test('recognizes caption JSON', () => {
	expect(
		isCaptionJson([
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

test('accepts an empty caption array when the schema identifies it', () => {
	expect(isCaptionJsonArray([])).toBe(true);
	expect(isCaptionJson([])).toBe(false);
});

test('rejects JSON that does not match the caption format', () => {
	expect(isCaptionJson({text: 'Hello'})).toBe(false);
	expect(
		isCaptionJson([
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
		isCaptionJson([
			{
				text: 'Hello',
				startMs: 0,
				endMs: 420,
				timestampMs: null,
			},
		]),
	).toBe(false);
});
