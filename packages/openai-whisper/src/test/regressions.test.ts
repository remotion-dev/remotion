import {expect, test} from 'bun:test';
import type {OpenAiVerboseTranscription} from '../openai-format';
import {
	isOpenAiWhisperJson,
	openAiWhisperApiToCaptions,
} from '../openai-whisper-api-to-captions';

const transcript1: OpenAiVerboseTranscription = {
	task: 'transcribe',
	text: 'it is 99% better',
	words: [
		{
			start: 1,
			end: 2,
			word: 'it',
		},
		{
			start: 2,
			end: 3,
			word: 'is',
		},
		{
			start: 3,
			end: 4,
			word: '99',
		},
		{
			start: 4,
			end: 5,
			word: 'better',
		},
	],
	duration: 3,
	language: 'english',
};

test('recognizes OpenAI Whisper JSON', () => {
	expect(
		isOpenAiWhisperJson({language: 'english', text: 'Hello', words: []}),
	).toBe(true);
	expect(
		isOpenAiWhisperJson({language_code: 'eng', text: 'Hello', words: []}),
	).toBe(false);
});

const transcript2: OpenAiVerboseTranscription = {
	task: 'transcribe',
	text: 'in real-time functions.',
	words: [
		{
			end: 1,
			word: 'in',
			start: 0,
		},
		{
			end: 2,
			word: 'real',
			start: 1,
		},
		{
			end: 3,
			word: 'time',
			start: 2,
		},
		{
			end: 4,
			word: 'functions',
			start: 3,
		},
	],
	duration: 4,
	language: 'english',
};

test('Regression test 1', () => {
	expect(
		openAiWhisperApiToCaptions({transcription: transcript1}).captions,
	).toEqual([
		{
			confidence: null,
			endMs: 2000,
			startMs: 1000,
			text: 'it',
			timestampMs: 1500,
		},
		{
			confidence: null,
			endMs: 3000,
			startMs: 2000,
			text: ' is',
			timestampMs: 2500,
		},
		{
			confidence: null,
			endMs: 4000,
			startMs: 3000,
			text: ' 99%',
			timestampMs: 3500,
		},
		{
			confidence: null,
			endMs: 5000,
			startMs: 4000,
			text: ' better',
			timestampMs: 4500,
		},
	]);
});
test('Regression test 2', () => {
	expect(
		openAiWhisperApiToCaptions({transcription: transcript2}).captions,
	).toEqual([
		{
			confidence: null,
			endMs: 1000,
			startMs: 0,
			text: 'in',
			timestampMs: 500,
		},
		{
			confidence: null,
			endMs: 2000,
			startMs: 1000,
			text: ' real-',
			timestampMs: 1500,
		},
		{
			confidence: null,
			endMs: 3000,
			startMs: 2000,
			text: 'time',
			timestampMs: 2500,
		},
		{
			confidence: null,
			endMs: 4000,
			startMs: 3000,
			text: ' functions.',
			timestampMs: 3500,
		},
	]);
});

test('Issue 7298 - apostrophe variants', () => {
	expect(
		openAiWhisperApiToCaptions({
			transcription: {
				task: 'transcribe',
				text: " Let's go!",
				words: [
					{
						start: 0,
						end: 0.1,
						word: 'Let’s',
					},
					{
						start: 0.1,
						end: 0.2,
						word: 'go',
					},
				],
				duration: 0.2,
				language: 'english',
			},
		}).captions,
	).toEqual([
		{
			confidence: null,
			endMs: 100,
			startMs: 0,
			text: " Let's",
			timestampMs: 50,
		},
		{
			confidence: null,
			endMs: 200,
			startMs: 100,
			text: ' go!',
			timestampMs: 150.00000000000003,
		},
	]);
});

test.each([
	{
		name: 'malformed word text',
		words: [{word: 42, start: 0, end: 1}],
		error: 'words[0].word must be a string',
	},
	{
		name: 'malformed word timestamp',
		words: [{word: 'Hello', start: Number.POSITIVE_INFINITY, end: 1}],
		error: 'words[0].start must be a finite, non-negative number',
	},
	{
		name: 'reversed timestamps',
		words: [{word: 'Hello', start: 2, end: 1}],
		error: 'words[0].end must not be earlier than words[0].start',
	},
	{
		name: 'out-of-order words',
		words: [
			{word: 'Hello', start: 2, end: 3},
			{word: 'world', start: 1, end: 2},
		],
		error: 'words[1].start is out of timestamp order',
	},
])('rejects $name', ({words, error}) => {
	expect(() =>
		openAiWhisperApiToCaptions({
			transcription: {
				text: 'Hello world',
				words,
			} as unknown as OpenAiVerboseTranscription,
		}),
	).toThrow(`Invalid OpenAI Whisper transcription: ${error}`);
});

test('accepts extra provider fields', () => {
	expect(
		openAiWhisperApiToCaptions({
			transcription: {
				duration: 1,
				language: 'english',
				text: 'Hello',
				words: [
					{
						word: 'Hello',
						start: 0,
						end: 1,
						provider_added_field: true,
					},
				],
				provider_added_field: true,
			} as unknown as OpenAiVerboseTranscription,
		}),
	).toEqual({
		captions: [
			{
				confidence: null,
				endMs: 1000,
				startMs: 0,
				text: 'Hello',
				timestampMs: 500,
			},
		],
	});
});
