import {describe, expect, test} from 'bun:test';
import {createTikTokStyleCaptions} from '@remotion/captions';
import type {Caption} from '@remotion/captions';
import {
	frameToMilliseconds,
	getActivePageIndex,
	getActiveTokenIndex,
	getLatestStartedTokenIndex,
	getTokenScale,
	isTimeWithinHalfOpenInterval,
} from '../../elements/text/timed-captions/timed-captions';

const captions: Caption[] = [
	{
		text: 'One',
		startMs: 0,
		endMs: 600,
		timestampMs: 300,
		confidence: null,
	},
	{
		text: ' two',
		startMs: 600,
		endMs: 1000,
		timestampMs: 800,
		confidence: null,
	},
	{
		text: ' three',
		startMs: 1200,
		endMs: 1600,
		timestampMs: 1400,
		confidence: null,
	},
];

const {pages} = createTikTokStyleCaptions({
	captions,
	combineTokensWithinMilliseconds: 800,
});

describe('Timed Captions timing', () => {
	test('converts the composition frame directly to milliseconds', () => {
		expect(frameToMilliseconds(75, 30)).toBe(2500);
		expect(frameToMilliseconds(1, 24)).toBeCloseTo(1000 / 24);
	});

	test('uses half-open intervals', () => {
		expect(isTimeWithinHalfOpenInterval(0, 0, 600)).toBe(true);
		expect(isTimeWithinHalfOpenInterval(599.999, 0, 600)).toBe(true);
		expect(isTimeWithinHalfOpenInterval(600, 0, 600)).toBe(false);
	});

	test('returns no page before the transcript or for an empty transcript', () => {
		expect(getActivePageIndex(pages, -1)).toBe(-1);
		expect(getActivePageIndex([], 0)).toBe(-1);
	});

	test('keeps an intermediate page until the next page starts', () => {
		expect(pages).toHaveLength(2);
		expect(pages[0].durationMs).toBe(1200);
		expect(getActivePageIndex(pages, 0)).toBe(0);
		expect(getActivePageIndex(pages, 1199.999)).toBe(0);
		expect(getActivePageIndex(pages, 1200)).toBe(1);
	});

	test('hides the final page at its last token end', () => {
		expect(pages[1].durationMs).toBe(400);
		expect(getActivePageIndex(pages, 1599.999)).toBe(1);
		expect(getActivePageIndex(pages, 1600)).toBe(-1);
	});

	test('keeps exact token intervals including gaps', () => {
		expect(getActiveTokenIndex(pages[0].tokens, 599.999)).toBe(0);
		expect(getActiveTokenIndex(pages[0].tokens, 600)).toBe(1);
		expect(getActiveTokenIndex(pages[0].tokens, 1000)).toBe(-1);
	});

	test('keeps the background on the latest word during token gaps', () => {
		expect(getLatestStartedTokenIndex(pages[0].tokens, -1)).toBe(-1);
		expect(getLatestStartedTokenIndex(pages[0].tokens, 0)).toBe(0);
		expect(getLatestStartedTokenIndex(pages[0].tokens, 1000)).toBe(1);
	});

	test('animates scale in and out without changing inactive tokens', () => {
		const token = pages[0].tokens[0];
		expect(getTokenScale({currentTimeMs: -1, fps: 30, token})).toBe(1);
		expect(getTokenScale({currentTimeMs: 0, fps: 30, token})).toBe(1);
		const enteredScale = getTokenScale({currentTimeMs: 100, fps: 30, token});
		expect(enteredScale).toBeGreaterThan(1);
		expect(getTokenScale({currentTimeMs: 550, fps: 30, token})).toBeLessThan(
			enteredScale,
		);
		expect(getTokenScale({currentTimeMs: 600, fps: 30, token})).toBe(1);
	});
});
