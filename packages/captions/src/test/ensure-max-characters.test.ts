import {expect, test} from 'bun:test';
import type {Caption} from '../caption';
import {ensureMaxCharactersPerLine} from '../ensure-max-characters-per-line';

test('Ensure max characters per line', () => {
	const captions: Caption[] = [
		{
			confidence: 1,
			endMs: 6000,
			startMs: 3000,
			text: 'This is a demonstration of SRT subtitles.',
			timestampMs: 4500,
		},
		{
			confidence: 1,
			endMs: 10500,
			startMs: 7000,
			text: 'You can use SRT files to add subtitles to your videos.',
			timestampMs: 8750,
		},
	];

	// TODO: This creates captions that are not nice!
	expect(ensureMaxCharactersPerLine({captions, maxCharsPerLine: 42})).toEqual({
		segments: [
			[
				{
					text: ' This',
					startMs: 3000,
					endMs: 6000,
					confidence: 1,
					timestampMs: 4500,
				},
				{
					text: 'is',
					startMs: 3000,
					endMs: 6000,
					confidence: 1,
					timestampMs: 4500,
				},
				{
					text: 'a',
					startMs: 3000,
					endMs: 6000,
					confidence: 1,
					timestampMs: 4500,
				},
				{
					text: 'demonstration',
					startMs: 3000,
					endMs: 6000,
					confidence: 1,
					timestampMs: 4500,
				},
				{
					text: 'of',
					startMs: 3000,
					endMs: 6000,
					confidence: 1,
					timestampMs: 4500,
				},
				{
					text: 'SRT',
					startMs: 3000,
					endMs: 6000,
					confidence: 1,
					timestampMs: 4500,
				},
				{
					text: 'subtitles.',
					startMs: 3000,
					endMs: 6000,
					confidence: 1,
					timestampMs: 4500,
				},
				{
					text: ' You',
					startMs: 7000,
					endMs: 10500,
					confidence: 1,
					timestampMs: 8750,
				},
			],
			[
				{
					text: 'can',
					startMs: 7000,
					endMs: 10500,
					confidence: 1,
					timestampMs: 8750,
				},
				{
					text: 'use',
					startMs: 7000,
					endMs: 10500,
					confidence: 1,
					timestampMs: 8750,
				},
				{
					text: 'SRT',
					startMs: 7000,
					endMs: 10500,
					confidence: 1,
					timestampMs: 8750,
				},
				{
					text: 'files',
					startMs: 7000,
					endMs: 10500,
					confidence: 1,
					timestampMs: 8750,
				},
				{
					text: 'to',
					startMs: 7000,
					endMs: 10500,
					confidence: 1,
					timestampMs: 8750,
				},
				{
					text: 'add',
					startMs: 7000,
					endMs: 10500,
					confidence: 1,
					timestampMs: 8750,
				},
				{
					text: 'subtitles',
					startMs: 7000,
					endMs: 10500,
					confidence: 1,
					timestampMs: 8750,
				},
			],
			[
				{
					text: 'to',
					startMs: 7000,
					endMs: 10500,
					confidence: 1,
					timestampMs: 8750,
				},
				{
					text: 'your',
					startMs: 7000,
					endMs: 10500,
					confidence: 1,
					timestampMs: 8750,
				},
				{
					text: 'videos.',
					startMs: 7000,
					endMs: 10500,
					confidence: 1,
					timestampMs: 8750,
				},
			],
		],
	});
});

test('Does not emit standalone whitespace captions', () => {
	const captions: Caption[] = [
		{
			confidence: 1,
			endMs: 1000,
			startMs: 0,
			text: " Using Remotion's TikTok template,",
			timestampMs: 500,
		},
	];

	expect(ensureMaxCharactersPerLine({captions, maxCharsPerLine: 20})).toEqual({
		segments: [
			[
				{...captions[0], text: ' Using'},
				{...captions[0], text: "Remotion's"},
			],
			[
				{...captions[0], text: 'TikTok'},
				{...captions[0], text: 'template,'},
			],
		],
	});
});

test('Preserves a forced page break on the final split word', () => {
	const firstCaption: Caption = {
		confidence: 1,
		endMs: 1000,
		startMs: 0,
		text: ' Hello there',
		timestampMs: 500,
		pageBreakAfter: true,
	};
	const secondCaption: Caption = {
		confidence: 1,
		endMs: 2000,
		startMs: 1000,
		text: ' Remotion',
		timestampMs: 1500,
	};

	expect(
		ensureMaxCharactersPerLine({
			captions: [firstCaption, secondCaption],
			maxCharsPerLine: 100,
		}),
	).toEqual({
		segments: [
			[
				{
					confidence: 1,
					endMs: 1000,
					startMs: 0,
					text: ' Hello',
					timestampMs: 500,
				},
				{...firstCaption, text: 'there'},
			],
			[{...secondCaption, text: ' Remotion'}],
		],
	});
});
