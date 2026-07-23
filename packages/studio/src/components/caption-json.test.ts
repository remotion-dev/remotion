import {expect, test} from 'bun:test';
import {isCaptionJson} from './caption-json';

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

test('rejects JSON that does not match the caption format', () => {
	expect(isCaptionJson([])).toBe(false);
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
