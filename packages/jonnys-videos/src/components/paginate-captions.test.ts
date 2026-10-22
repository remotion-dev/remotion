import {expect, test} from 'bun:test';
import type {Caption} from '@remotion/captions';
import {createSentenceAwareCaptionPages} from './paginate-captions';

test('treats a forced page break as a page boundary', () => {
	const captions = [
		{
			text: 'This',
			startMs: 0,
			endMs: 200,
			timestampMs: 100,
			confidence: null,
		},
		{
			text: ' should',
			startMs: 200,
			endMs: 400,
			timestampMs: 300,
			confidence: null,
			pageBreakAfter: true,
		},
		{
			text: ' start',
			startMs: 400,
			endMs: 600,
			timestampMs: 500,
			confidence: null,
		},
		{
			text: ' a new page',
			startMs: 600,
			endMs: 800,
			timestampMs: 700,
			confidence: null,
		},
	] satisfies Caption[];

	const pages = createSentenceAwareCaptionPages({
		captions,
		combineTokensWithinMilliseconds: 10_000,
		layout: null,
	});

	expect(
		pages.map((page) => page.tokens.map((token) => token.text.trim())),
	).toEqual([
		['This', 'should'],
		['start', 'a new page'],
	]);
	expect(pages.map((page) => page.startMs)).toEqual([0, 400]);
});
