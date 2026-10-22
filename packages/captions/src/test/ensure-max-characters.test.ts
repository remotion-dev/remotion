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

	expect(ensureMaxCharactersPerLine({captions, maxCharsPerLine: 42})).toEqual({
		segments: [
			[
				' This',
				' is',
				' a',
				' demonstration',
				' of',
				' SRT',
				' subtitles.',
			].map((text) => ({...captions[0], text})),
			[' You', ' can', ' use', ' SRT', ' files', ' to', ' add'].map((text) => ({
				...captions[1],
				text,
			})),
			[' subtitles', ' to', ' your', ' videos.'].map((text) => ({
				...captions[1],
				text,
			})),
		],
	});
});

test('Preserves spaces between words within a caption', () => {
	const caption: Caption = {
		text: 'Hello world again',
		startMs: 0,
		endMs: 1000,
		timestampMs: 500,
		confidence: 1,
	};
	const {segments} = ensureMaxCharactersPerLine({
		captions: [caption],
		maxCharsPerLine: 100,
	});

	expect(
		segments[0]
			.map((word) => word.text)
			.join('')
			.trim(),
	).toBe(caption.text);
});

test('Does not emit empty segments before oversized words', () => {
	const first: Caption = {
		text: ' extraordinary',
		startMs: 0,
		endMs: 1000,
		timestampMs: 500,
		confidence: 1,
		pageBreakAfter: true,
	};
	const second: Caption = {
		text: ' caption',
		startMs: 1000,
		endMs: 2000,
		timestampMs: 1500,
		confidence: 1,
	};

	expect(
		ensureMaxCharactersPerLine({
			captions: [first, second],
			maxCharsPerLine: 4,
		}),
	).toEqual({segments: [[first], [second]]});
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
				{...captions[0], text: " Remotion's"},
			],
			[
				{...captions[0], text: ' TikTok'},
				{...captions[0], text: ' template,'},
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
				{...firstCaption, text: ' there'},
			],
			[{...secondCaption, text: ' Remotion'}],
		],
	});
});
