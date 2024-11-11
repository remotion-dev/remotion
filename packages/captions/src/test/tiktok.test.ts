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
