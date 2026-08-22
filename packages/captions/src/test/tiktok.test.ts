import {expect, test} from 'bun:test';
import type {Caption} from '../caption';
import {createTikTokStyleCaptions} from '../create-tiktok-style-captions';

const captions: Caption[] = [
	{
		text: 'Using',
		startMs: 40,
		endMs: 300,
		timestampMs: 200,
		confidence: 0.948258,
	},
	{
		text: " Remotion's",
		startMs: 300,
		endMs: 900,
		timestampMs: 440,
		confidence: 0.548411,
	},
	{
		text: ' TikTok',
		startMs: 900,
		endMs: 1260,
		timestampMs: 1080,
		confidence: 0.953265,
	},
	{
		text: ' template,',
		startMs: 1260,
		endMs: 1950,
		timestampMs: 1600,
		confidence: 0.968126,
	},
];

test('Should create captions', () => {
	const {pages: tikTokStyleCaptions} = createTikTokStyleCaptions({
		captions,
		combineTokensWithinMilliseconds: 500,
	});
	expect(tikTokStyleCaptions).toEqual([
		{
			durationMs: 860,
			text: "Using Remotion's",
			startMs: 40,
			tokens: [
				{
					text: 'Using',
					fromMs: 40,
					toMs: 300,
				},
				{
					text: " Remotion's",
					fromMs: 300,
					toMs: 900,
				},
			],
		},
		{
			text: 'TikTok template,',
			startMs: 900,
			durationMs: 1050,
			tokens: [
				{
					text: 'TikTok',
					fromMs: 900,
					toMs: 1260,
				},
				{
					text: ' template,',
					fromMs: 1260,
					toMs: 1950,
				},
			],
		},
	]);
});

test('Should finalize the duration when captions end in whitespace', () => {
	const {pages} = createTikTokStyleCaptions({
		captions: [
			{
				text: ' one',
				startMs: 0,
				endMs: 500,
				timestampMs: 0,
				confidence: null,
			},
			{
				text: ' two',
				startMs: 500,
				endMs: 1000,
				timestampMs: 500,
				confidence: null,
			},
			{
				text: ' ',
				startMs: 2000,
				endMs: 2000,
				timestampMs: 2000,
				confidence: null,
			},
		],
		combineTokensWithinMilliseconds: 200,
	});

	expect(pages).toEqual([
		{
			text: 'one',
			startMs: 0,
			durationMs: 500,
			tokens: [{text: 'one', fromMs: 0, toMs: 500}],
		},
		{
			text: 'two',
			startMs: 500,
			durationMs: 1500,
			tokens: [{text: 'two', fromMs: 500, toMs: 1000}],
		},
	]);
});

test('Should start a new page after the configured silence duration', () => {
	const {pages} = createTikTokStyleCaptions({
		captions: [
			{
				text: 'hello',
				startMs: 0,
				endMs: 200,
				timestampMs: 100,
				confidence: null,
			},
			{
				text: ' there',
				startMs: 200,
				endMs: 400,
				timestampMs: 300,
				confidence: null,
			},
			{
				text: ' again',
				startMs: 5000,
				endMs: 5200,
				timestampMs: 5100,
				confidence: null,
			},
		],
		combineTokensWithinMilliseconds: 10000,
		breakOnSilenceAfterMilliseconds: 1000,
	});

	expect(pages).toEqual([
		{
			text: 'hello there',
			startMs: 0,
			durationMs: 5000,
			tokens: [
				{text: 'hello', fromMs: 0, toMs: 200},
				{text: ' there', fromMs: 200, toMs: 400},
			],
		},
		{
			text: 'again',
			startMs: 5000,
			durationMs: 200,
			tokens: [{text: 'again', fromMs: 5000, toMs: 5200}],
		},
	]);
});

test('Should not break when the silence is shorter than the configured duration', () => {
	const {pages} = createTikTokStyleCaptions({
		captions: [
			{
				text: 'hello',
				startMs: 0,
				endMs: 200,
				timestampMs: 100,
				confidence: null,
			},
			{
				text: ' there',
				startMs: 900,
				endMs: 1100,
				timestampMs: 1000,
				confidence: null,
			},
		],
		combineTokensWithinMilliseconds: 10000,
		breakOnSilenceAfterMilliseconds: 1000,
	});

	expect(pages.map((p) => p.text)).toEqual(['hello there']);
});

test('Should never break inside a word, even across a silence', () => {
	const {pages} = createTikTokStyleCaptions({
		captions: [
			{
				text: 'Dr.',
				startMs: 0,
				endMs: 200,
				timestampMs: 100,
				confidence: null,
			},
			// No leading space means continuation, so never a page break
			{
				text: 'Strange',
				startMs: 5000,
				endMs: 5300,
				timestampMs: 5150,
				confidence: null,
			},
		],
		combineTokensWithinMilliseconds: 100,
		breakOnSilenceAfterMilliseconds: 500,
	});

	expect(pages).toEqual([
		{
			text: 'Dr.Strange',
			startMs: 0,
			durationMs: 5300,
			tokens: [
				{text: 'Dr.', fromMs: 0, toMs: 200},
				{text: 'Strange', fromMs: 5000, toMs: 5300},
			],
		},
	]);
});

test('Should break at every word boundary when the silence duration is 0', () => {
	const {pages} = createTikTokStyleCaptions({
		captions: [
			{
				text: 'one',
				startMs: 0,
				endMs: 200,
				timestampMs: 100,
				confidence: null,
			},
			{
				text: ' two',
				startMs: 200,
				endMs: 400,
				timestampMs: 300,
				confidence: null,
			},
			{
				text: ' three',
				startMs: 400,
				endMs: 600,
				timestampMs: 500,
				confidence: null,
			},
		],
		combineTokensWithinMilliseconds: 10000,
		breakOnSilenceAfterMilliseconds: 0,
	});

	expect(pages.map((p) => p.text)).toEqual(['one', 'two', 'three']);
});
