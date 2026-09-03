import {expect, test} from 'bun:test';
import type {ElevenLabsTranscript} from '../elevenlabs-transcript';
import {
	elevenLabsTranscriptToCaptions,
	isElevenLabsTranscriptJson,
} from '../elevenlabs-transcript-to-captions';
import expectedCaptions from './gimme-gimme-captions-snapshot.json';
import transcript from './gimme-gimme-transcript.json';

test('recognizes ElevenLabs transcript JSON', () => {
	expect(
		isElevenLabsTranscriptJson({language_code: 'eng', text: 'Hello'}),
	).toBe(true);
	expect(isElevenLabsTranscriptJson({language: 'english', text: 'Hello'})).toBe(
		false,
	);
});

test('converts elevenlabs transcript to captions', () => {
	const {captions} = elevenLabsTranscriptToCaptions({
		transcript: transcript as ElevenLabsTranscript,
	});

	expect(captions).toEqual(expectedCaptions);
});

test('handles invalid transcript input', () => {
	expect(() =>
		elevenLabsTranscriptToCaptions({
			transcript: {} as unknown as ElevenLabsTranscript,
		}),
	).toThrowError(/Invalid ElevenLabs transcript/);
});

test('handles empty words array', () => {
	const {captions} = elevenLabsTranscriptToCaptions({
		transcript: {
			language_code: 'eng',
			language_probability: 1,
			text: '',
			words: [],
			transcription_id: 'test',
		},
	});

	expect(captions).toEqual([]);
});

test.each([
	{
		name: 'non-object entry',
		words: [null],
		error: 'words[0] must be an object',
	},
	{
		name: 'invalid timestamp',
		words: [{type: 'word', text: 'Hello', start: Number.NaN, end: 1}],
		error: 'words[0].start must be a finite, non-negative number',
	},
	{
		name: 'invalid consumed spacing timestamp',
		words: [
			{type: 'word', text: 'Hello', start: 0, end: 1},
			{type: 'spacing', text: ' ', start: 'later', end: 2},
			{type: 'word', text: 'world', start: 2, end: 3},
		],
		error: 'words[1].start must be a finite, non-negative number',
	},
	{
		name: 'reversed timestamps',
		words: [{type: 'word', text: 'Hello', start: 2, end: 1}],
		error: 'words[0].end must not be earlier than words[0].start',
	},
	{
		name: 'out-of-order words',
		words: [
			{type: 'word', text: 'Later', start: 2, end: 3},
			{type: 'word', text: 'Earlier', start: 1, end: 2},
		],
		error: 'words[1].start is out of timestamp order',
	},
])('rejects $name', ({words, error}) => {
	expect(() =>
		elevenLabsTranscriptToCaptions({
			transcript: {words} as unknown as ElevenLabsTranscript,
		}),
	).toThrow(`Invalid ElevenLabs transcript: ${error}`);
});

test('ignores unknown fields and entry types', () => {
	const {captions} = elevenLabsTranscriptToCaptions({
		transcript: {
			language_code: 'eng',
			language_probability: 1,
			text: 'Hello',
			transcription_id: 'test',
			provider_added_field: true,
			words: [
				{type: 'provider_event', provider_added_field: true},
				{
					type: 'word',
					text: 'Hello',
					start: 0,
					end: 1,
					provider_added_field: true,
				},
			],
		} as unknown as ElevenLabsTranscript,
	});

	expect(captions).toEqual([
		{
			confidence: null,
			startMs: 0,
			endMs: 1000,
			text: 'Hello',
			timestampMs: 500,
		},
	]);
});
